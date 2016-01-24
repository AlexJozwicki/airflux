/* @flow */
import * as _                   from './utils';
import invariant                from 'invariant';

import Publisher                from './Publisher';
import Join                     from './Join';
import type { JoinStrategies }  from './Join';

import type Action              from './Action';
import type { ActionFunctor }   from './Action';
import type Store               from './Store';

export type SubscriptionObj = {
    stop: Function;
    listenable: (Publisher | Array< Publisher >);
};


/**
 * A module of methods related to listening.
 * @constructor
 * @extends {Publisher}
 */
export default class Listener extends Publisher {
    _subscriptions: Array< SubscriptionObj > = [];

    constructor() {
        super();
    }


    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Publisher} listenable The listenable we want to search for
     * @returns {boolean} The result of a recursive search among `this._subscriptions`
     */
    hasListener( listenable: Publisher ) : boolean {
        const pubs : Array< Publisher > = this._subscriptions
            .reduce( ( r, sub ) => r.concat( sub.listenable ), [] );

        // TODO: replace by .find one day, with a polyfill
        return pubs.filter( pub => ( pub === listenable || ( pub.hasListener && pub.hasListener( listenable ) ) ) )
                   .length > 0;
    }



    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Publisher} listenable An Action or Store that should be listened to.
     */
    validateListening( listenable: Publisher | ActionFunctor ) {
        invariant( listenable !== this, 'Listener is not able to listen to itself' );
        invariant( typeof listenable.listen === 'function', 'listenable should be a Publisher' );
        invariant( !(listenable.hasListener && listenable.hasListener(this)), 'Listener cannot listen to this listenable because of circular loop' );
    }

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Publisher} listenable An Action or Store that should be listened to.
     * @param {Function} callback The callback to register as event handler
     * @param {Function} defaultCallback The callback to register as default handler
     *
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo( listenable: Publisher | ActionFunctor, callback: Function, defaultCallback: ?Function ) : SubscriptionObj  {
        this.validateListening( listenable );
        invariant( callback != null, 'listenTo should be called with a valid callback' );

        if( !!defaultCallback )
            this.fetchInitialState( listenable, defaultCallback );

        var desub = listenable.listen( callback.bind( this ) );
        var unsubscriber = () => {
            var index = this._subscriptions.indexOf(subscriptionObj);
            invariant( index >= 0, 'Tried to remove listen already gone from subscriptions list!' );
            this._subscriptions.splice( index, 1 );
            desub();
        };

        const subscriptionObj = this.addSubscription( unsubscriber, listenable );
        return subscriptionObj;
    }

    /**
     * Stops listening to a single listenable
     *
     * @param {Publisher} listenable The action or store we no longer want to listen to
     * @returns {boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo( listenable: Publisher ) : boolean {
        var subs = this._subscriptions || [];

        for( var i = 0; i < subs.length; ++i ) {
            var sub = subs[i];
            if( sub.listenable === listenable ) {
                sub.stop();
                invariant( subs.indexOf( sub ) === -1, 'Failed to remove listen from subscriptions list!' );
                return true;
            }
        }
        return false;
    }

    /**
     * Adds a subscription
     */
    addSubscription( stop: () => void, listenable: Publisher ) : SubscriptionObj {
        const subscriptionObj : SubscriptionObj = { stop, listenable };
        this._subscriptions.push( subscriptionObj );
        return subscriptionObj;
    }

    /**
     * Removes a subscription
     */
    removeSubscription( subscription: SubscriptionObj ) {
        const index = this._subscriptions.indexOf( subscription );
        if( index < 0 ) return;

        this._subscriptions.splice( index, 1 );
    }


    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll() {
        const subs = this._subscriptions || [];
        var remaining : number = 0;

        while( remaining = subs.length ) {
            subs[ 0 ].stop();
            invariant( subs.length === remaining - 1, 'Failed to remove listen from subscriptions list!' );
        }
    }

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `state` getter.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchInitialState( listenable: Publisher, defaultCallback: Function ) {
        var self = this;
        if( _.isFunction(defaultCallback) && listenable.state ) {
            var data = listenable.state;
            if( data && _.isFunction( data.then ) ) {
                data.then(function() {
                    defaultCallback.apply(self, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    }

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {Function} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing( callback: Function, ...listenables: Array< Publisher > ) : SubscriptionObj {
        return this._createJoin( 'last', callback, listenables );
    }


    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading( callback: Function, ...listenables: Array< Publisher > ) : SubscriptionObj {
        return this._createJoin( 'first', callback, listenables );
    }

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat( callback: Function, ...listenables: Array< Publisher > ) : SubscriptionObj {
        return this._createJoin( 'all', callback, listenables );
    }


    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict( callback: Function, ...listenables: Array< Publisher > ) : SubscriptionObj {
        return this._createJoin( 'strict', callback, listenables );
    }


    _createJoin( strategy: JoinStrategies, callback: Function, listenables: Array< Publisher > ) : SubscriptionObj {
        invariant( listenables.length >= 2, 'Cannot create a join with less than 2 listenables!' );

        // validate everything
        listenables.forEach( listenable => this.validateListening( listenable ) );

        const stop: Function = new Join( listenables, strategy ).listen( callback );

        var subobj : SubscriptionObj = {
            listenable  : listenables,
            stop: () => {
                stop();
                this.removeSubscription( subobj );
            }
        };

        this._subscriptions.push( subobj );

        return subobj;
    }
}
