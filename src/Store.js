/* @flow */
import Listener from './Listener';

export type StateMutation< State > = ( x: State ) => State;

/**
 */
export default class Store< State > extends Listener {
//    _state  : State;

    constructor() {
        super();
    }

    get eventType() : string { return 'change'; }
/*
    get state() : State { return this._state; }
    set state( state: State ) { this._state = state; this.publishState(); }
*/
    /**
     * Publishes the state to all subscribers.
     * This ensures that the stores always publishes the same data/signature.
     */
    publishState( transform: ?StateMutation< State > = null ) {
        if( !!transform ) {
            this._state = transform( this._state );
        }

        super.trigger( this.state );
    }
}
