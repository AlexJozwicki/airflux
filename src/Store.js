/* @flow */
import Listener from './Listener';

export type StateMutation< State > = ( x: State ) => State;

/**
 */
export default class Store< State > extends Listener {
    state  : State;

    constructor() {
        super();
    }

    get eventLabel() : string { return 'change'; }

    /**
     * Publishes the state to all subscribers.
     * This ensures that the stores always publishes the same data/signature.
     */
    publishState() {
        super.trigger( this.state );
    }

    setState( transform: ?StateMutation< State > = null ) {
        if( !!transform ) {
            this.state = transform( this.state );
        }

        super.trigger( this.state );
    }
}
