/* @flow */
import AsyncResultAction                from './AsyncResultAction';
import type Action, { ActionFunctor }   from './Action';

export type PromiseFunctor = $All< ActionFunctor, {
    completed   : Action;
    failed      : Action;
} >;



/**
 * @example
 *   new PromiseAction( () => fetch( '/url' ) )
 */
export default class PromiseAction extends AsyncResultAction {
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

        promise.then( ( ...response ) => this.completed.trigger( ...response ) ).catch( ( ...error ) => this.failed.asFunction( ...error ) );
    }

}
