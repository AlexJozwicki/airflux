/* @flow */
import Action from './Action';


export default class AsyncResultAction extends Action {
    completed   : Action;
    failed      : Action;

    constructor( listenFunction: ?Function ) {
        super();

        this.children.completed = new Action();
        this.children.failed = new Action();

        Object.defineProperty( this, 'completed', { value: this.children.completed } );
        Object.defineProperty( this, 'failed', { value: this.children.failed } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }
    }
}
