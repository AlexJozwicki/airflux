/* @flow */
import Action from './Action';





export default class AsyncResultAction< T, Fn: (...args: Array< any > ) => Promise< T > > extends Action< Fn > {
    completed       : Action< ( x: T ) => any >;
    failed          : Action< any >;
    //_listenFunction : Fn;

    /**
     * By default we create this type of action as synchronous.
     * If the action is returning a Promise, it's safe to consider that most of the time the action itself is quite simple,
     * and therefore doesn't necessitate to be async.
     */
    constructor( listenFunction: Fn, sync?: boolean = true ) {
        super( sync );

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
    triggerPromise( ...args: any[] ) : Promise< T > {
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
