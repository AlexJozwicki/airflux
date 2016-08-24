/* @flow */
import Action from './Action';





export default class AsyncResultAction< T, Fn: (...args: Array< any > ) => Promise< T > > extends Action {
    completed       : Action;
    failed          : Action;
    //_listenFunction : Fn;

    constructor( listenFunction: Fn ) {
        super();

        this.children.completed = new Action();
        this.children.failed = new Action();
        //this._listenFunction = listenFunction;

        Object.defineProperty( this, 'completed', { value: this.children.completed } );
        Object.defineProperty( this, 'failed', { value: this.children.failed } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }
    }

    get asFunction() : Fn {
        return this.createFunctor( this.triggerPromise );
    }


    processResult( promise: ?Promise< T > ) {
        if( !( promise instanceof Promise ) ) return;
        promise.then( ( ...response ) => this.completed.trigger( ...response ) ).catch( ( ...error ) => this.failed.asFunction( ...error ) );
    }

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise() : Promise< T > {
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
