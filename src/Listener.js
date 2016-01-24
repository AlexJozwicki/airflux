/* @flow */
import * as _ from './utils';
import Publisher from './Publisher';
import Join from './Join';

import type Action from './Action';
import type Store from './Store';

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
    subscriptions: Array< SubscriptionObj > = [];

    constructor() {
        super();
//        this.subscriptions = [];
    }


    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener( listenable: Publisher ) : boolean {
        var subs = this.subscriptions || [];
        for (var i = 0; i < subs.length; ++i) {
            var listenables = [].concat(subs[i].listenable);
            for (var j = 0; j < listenables.length; ++j) {
                var listener = listenables[j];
                if (listener === listenable) {
                    return true;
                }
                if (listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
        }
        return false;
    }



    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening( listenable: Publisher ) : ?string {
        if (listenable === this) {
            return 'Listener is not able to listen to itself';
        }
        if (!_.isFunction(listenable.listen)) {
            return `${listenable} is missing a listen method`;
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return 'Listener cannot listen to this listenable because of circular loop';
        }
    }

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    // TODO: deprecate the callback being a string
    listenTo( listenable: Publisher, callback: Function, defaultCallback: ?Function ) : SubscriptionObj  {
        _.throwIf( this.validateListening( listenable ) );

        if( !!defaultCallback )
            this.fetchInitialState( listenable, defaultCallback );

        var desub = listenable.listen( callback, this );
        var unsubscriber = () => {
            var index = this.subscriptions.indexOf(subscriptionObj);
            _.throwIf( index === -1, 'Tried to remove listen already gone from subscriptions list!' );
            this.subscriptions.splice( index, 1 );
            desub();
        };

        const subscriptionObj = this.addSubscription( unsubscriber, listenable );
        return subscriptionObj;
    }

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo( listenable: Publisher ) : boolean {
        var subs = this.subscriptions || [];

        // TODO: use lodash array find or something
        for (var i = 0; i < subs.length; ++i) {
            var sub = subs[i];
            if( sub.listenable === listenable ) {
                sub.stop();
                _.throwIf(subs.indexOf(sub) !== -1,
                        'Failed to remove listen from subscriptions list!');
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
        this.subscriptions.push( subscriptionObj );
        return subscriptionObj;
    }

    /**
     * Removes a subscription
     */
    removeSubscription( subscription: SubscriptionObj ) {
        for( var i = 0; i < this.subscriptions.length; ++i ) {
            if( this.subscriptions[i] === subscription ) {
                this.subscriptions.splice( i, 1 );
                return true;
            }
        }
    }


    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll() {
        var subs = this.subscriptions || [];
        var remaining;
        while ((remaining = subs.length)) {
            subs[0].stop();
            _.throwIf(subs.length !== remaining - 1,
                    'Failed to remove listen from subscriptions list!');
        }
    }

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `state` getter.
     * @param {Action|Store} listenable The publisher we want to get initial state from
     * @param {Function|String} defaultCallback The method to receive the data
     */
     // TODO: deprecate the callback being a string
    fetchInitialState( listenable: Publisher, defaultCallback: Function ) {
        var self = this;
        if( _.isFunction(defaultCallback) && listenable.state ) {
            var data = listenable.state;
            if (data && _.isFunction(data.then)) {
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


    _createJoin( strategy: string, callback: Function, listenables: Array< Publisher > ) : SubscriptionObj {
        _.throwIf( listenables.length < 2, 'Cannot create a join with less than 2 listenables!' );

        // validate everything
        listenables.forEach( ( listenable ) => _.throwIf( this.validateListening( listenable ) ) );

        const stop: Function = new Join( listenables, strategy ).listen( callback );

        var subobj : SubscriptionObj = {
            listenable  : listenables,
            stop: () => {
                stop();
                this.removeSubscription( subobj );
            }
        };

        this.subscriptions.push( subobj );

        return subobj;
    }
}
