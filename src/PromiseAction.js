/* @noflow */
import AsyncResultAction                from './AsyncResultAction';
import type Action, { ActionFunctor }   from './Action';

export type PromiseFunctor = $All< ActionFunctor, {
} >;



/**
 * This class is a very simple helper for AsyncResultAction.
 * asFunction will automatically use triggerPromise, so that when you call the action you get a Promise.:
 * This is optional on the AsyncResultAction.
 *
 * @example
 *   new PromiseAction( () => fetch( '/url' ) )
 */
export default class PromiseAction< T > extends AsyncResultAction< T > {
    _listenFunction: () => Promise< T >;

    constructor( listenFunction: () => Promise< T > ) {
        super( null );
        this._listenFunction = listenFunction;
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : PromiseFunctor {
        const _this = this;

        var functor = ( ...args ) => {
            const promise = this._listenFunction.call( this, args );
            promise.then( ( ...response ) => this.completed.trigger( ...response ) ).catch( ( ...error ) => this.failed.asFunction( ...error ) );
            return promise;
        };

        Object.defineProperty( functor, '_isActionFunctor', { value: true } );
        Object.defineProperty( functor, 'action', { value: this } );
        Object.defineProperty( functor, 'listen', { value: ( fn, bindCtx ) => {
            return PromiseAction.prototype.listen.call( this, fn, bindCtx );
        } } );
        Object.defineProperty( functor, 'listenOnce', { value: ( fn, bindCtx ) => {
            return PromiseAction.prototype.listenOnce.call( this, fn, bindCtx );
        } } );

        Object.keys( this.children ).forEach( ( childName ) => {
            Object.defineProperty( functor, childName, { value: this.children[ childName ].asFunction } );
        });

        return functor;
    }
}
