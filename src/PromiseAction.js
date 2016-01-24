/* @flow */
import AsyncResultAction                from './AsyncResultAction';
import type Action, { ActionFunctor }   from './Action';

export type PromiseFunctor = $All< ActionFunctor, {
    completed   : Action;
    failed      : Action;
} >;


export default class PromiseAction extends AsyncResultAction {
    completed   : Action;
    failed      : Action;

    constructor( listenFunction: Function ) {
        super( listenFunction );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : PromiseFunctor {
        return this.createFunctor( this.triggerPromise );
    }

    processResult( promise: ?Promise ) {
        if( !( promise instanceof Promise ) ) return;

        // TODO: test a multiple response
        promise.then( ( ...response ) => this.completed.trigger( ...response ), ( ...error ) => this.failed.asFunction( ...error ) );
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
