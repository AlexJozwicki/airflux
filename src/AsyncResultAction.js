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

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise() : Promise< * > {
        const args = arguments;

        const promise = new Promise( ( resolve, reject ) => {
            var removeSuccess = this.completed.listen( ( args ) => {
                removeSuccess();
                removeFailed();
                resolve( args );
            });

            var removeFailed = this.failed.listen( ( args ) => {
                removeSuccess();
                removeFailed();
                reject( args );
            });

            this.trigger.apply( this, args );
        });

        return promise;
    }
}
