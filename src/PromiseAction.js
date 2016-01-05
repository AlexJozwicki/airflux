import Action from './Action';



export default PromiseAction< T > extends Action {
    completed           : Action;
    failed              : Action;

    constructor( listenFunction: ( any ) => Promise< T > ) {
        super();

        // invariant( !!listenFunction, 'PromiseAction needs to have a valid listen function to work' )

        this.children.completed = new Action();
        Object.defineProperty( this, 'completed', { value: this.children.completed } );

        this.children.failed = new Action();
        Object.defineProperty( this, 'failed', { value: this.children.failed } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Functor {
        return this._createFunctor( this.triggerPromise );
    }

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} promise The result to use or a promise to which to listen.
     */
    resolve( promise: Promise ) {
        if( !_.isPromise( promise ) ) {
            this.completed.asFunction( promise );
            return;
        }

        return promise.then( ( response ) => this.completed.asFunction( response ), ( error ) => this.failed.asFunction( error ) );
    }


    reject( result: any ) {
        if( _.isPromise( result ) ) {
            console.warn('Use #resolve() for promises.');
            return;
        }

        this.failed( result );
    }


    then( onSuccess: ?Function, onFailure: ?Function ) {
        if( onSuccess ) {
            this.completed.listenOnce( onSuccess );
        }
        if( onFailure ) {
            this.failed.listenOnce( onFailure );
        }
    }

    catch( onFailure: Function ) {
        this.then(null, onFailure);
    }

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise() : Promise {
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
