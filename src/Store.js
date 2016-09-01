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

    setState( partialState: $Shape< State >, callback?: () => void ) {
        this.state = { ...this.state, partialState };
        this.publishState();
        if( typeof callback === 'function' ) {
            callback();
        }
    }
}
