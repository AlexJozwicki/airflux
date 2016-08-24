/* @flow */
import Listener from './Listener';
import type Action from './Action';

export type StateMutation< State > = ( x: ?State ) => State;



export function ActionHandler( action: Action< any > ) {
    return function( target: Object, key: string, descriptor: Object ) : Object {
        const previousActivate =  target.activateActionHandlers || ( () => 0 );

        target.activateActionHandlers = function() {
            previousActivate.call( this );
            console.log( `activated ${key}`, this[ key ] );

            target.activateActionHandlers = function() {};
        }
        return descriptor;
    }
}



/**
 */
export default class Store< State > extends Listener {
    state  : ?State = null;

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

    setState( transform: Object | StateMutation< State > ) {
        if( typeof transform === 'function' ) {
            this.state = transform( this.state );
        }

        super.trigger( this.state );
    }
}
