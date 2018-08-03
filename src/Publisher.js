/* @flow */
import * as _ from './utils';
import invariant from 'invariant';
import EventEmitter from 'eventemitter3';

export type UnsubscribeFunction = () => void;



/**
 * Base class of everything.
 * - actions are a directly subclass
 * - stores are inheriting from Listener
 */
export default class Publisher {
    _emitter: EventEmitter = new EventEmitter();

    /**
     * @protected
     */
    constructor() {
    }

    get eventLabel() : string { return 'event'; }


    /**
     * @abstract
     */
    processResult( result: ?Promise< * > ) {}

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {( x: any ) => ?any} callback The callback to register as event handler
     * @returns {UnsubscribeFunction} Callback that unsubscribes the registered event handler
     */
    listen( callback: ( x: any ) => ?any ) : UnsubscribeFunction {
        invariant( typeof callback === 'function', 'listen has to be given a valid callback function' );

        var aborted = false;

        var eventHandler = ( args ) => {
            if( aborted ) return;
            this.processResult( callback.apply( this, args ) );
        };

        this._emitter.addListener( this.eventLabel, eventHandler );

        return () => {
            aborted = true;
            this._emitter.removeListener( this.eventLabel, eventHandler );
        };
    }


    listenOnce( callback: ( x: any ) => ?any ) : UnsubscribeFunction {
        invariant( typeof callback === 'function', 'listenOnce has to be given a valid callback function' );

        var unsubscribe = this.listen( ( ...args: any[] ) => {
            unsubscribe();
            return callback.apply( this, args );
        });
        return unsubscribe;
    }

    /**
     * Publishes an event using `this._emitter` (if `shouldEmit` agrees)
     */
    triggerSync( ...args: any ) {
        this._emitter.emit( this.eventLabel, args );
    }

    /**
     * Tries to publish the event on the next tick
     */
    trigger( ...args: any ) {
        setTimeout( () => this.triggerSync( ...args ), 0 );
    }
}
