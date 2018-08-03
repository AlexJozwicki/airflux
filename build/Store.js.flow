/* @flow */
import Listener from './Listener';


export type StateMutation< State > = ( x: State ) => State;





/**
 */
export default class Store< State: Object > extends Listener {
    state  : State;

    constructor() {
        super();
    }


    /**
     * Publishes the state to all subscribers.
     * This ensures that the stores always publishes the same data/signature.
     */
    publishState() {
        super.trigger( this.state );
    }

    /**
     * Just like FluxComponent, pipe the content of another Store into the state of this one.
     */
    connectStore( store: Store< * >, stateKey: string, initialState?: boolean = false ) {
        this.state = this.state || {};
        this.state[ stateKey ] = store.state;
        this.listenTo( store, state => this.setState( { [ stateKey ]: state } ) );
    }

    /**
     * Just like React.Component, modifies the state with whatever you passed
     */
    setState( partialState: $Shape< State > | ( currentState: State ) => State, callback?: () => void ) {
        if( typeof partialState === 'function' ) {
            this.state = partialState( this.state );
        }
        else {
            this.state = { ...this.state, ...partialState };
        }

        this.publishState();
        if( typeof callback === 'function' ) {
            callback();
        }
    }

    /** @private */
    get eventLabel() : string { return 'change'; }
}
