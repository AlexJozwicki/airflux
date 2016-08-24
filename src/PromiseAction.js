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
export default class PromiseAction< T, Fn: (...args: Array< any > ) => Promise< T > > extends AsyncResultAction< T, Fn > {
    constructor( listenFunction: Fn ) {
        super( listenFunction );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Fn {
        return this.createFunctor( this.triggerPromise );
    }

    processResult( promise: ?Promise< T > ) {
        if( !( promise instanceof Promise ) ) return;
        promise.then( ( ...response ) => this.completed.trigger( ...response ) ).catch( ( ...error ) => this.failed.asFunction( ...error ) );
    }
}
