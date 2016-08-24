/* @flow */
import Action from './Action';
import type { ActionFunctor } from './Action';
import type { UnsubscribeFunction } from './Publisher';



export type AsyncFunctor< T, Fn > = $All< Fn, {
    completed           : Action< any >;
    failed              : Action< any >;
    _isActionFunctor    : boolean;
    action              : AsyncResultAction< T, Fn >;
    listen              : ( callback: ( x: any ) => ?Promise< * > ) => UnsubscribeFunction;
    listenOnce          : ( callback: ( x: any ) => ?Promise< * > ) => UnsubscribeFunction;
} >;






export default class AsyncResultAction< T, Fn: ( ...args: Array< any > ) => Promise< T > > extends Action {
    completed   : Action< T >;
    failed      : Action< any >;

    constructor( listenFunction: ( ...args: Array< * > ) => Promise< T > ) {
        super();

        this.children.completed = new Action();
        this.children.failed = new Action();

        Object.defineProperty( this, 'completed', { value: this.children.completed } );
        Object.defineProperty( this, 'failed', { value: this.children.failed } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }
    }

    createFunctor() : AsyncFunctor< T, Fn > {
        var functor = ( ...args: Array< any > ) => this.triggerPromise( ...args );

        Object.defineProperty( functor, '_isActionFunctor', { value: true } );
        Object.defineProperty( functor, 'action', { value: this } );
        Object.defineProperty( functor, 'listen', { value: ( fn, bindCtx ) => {
            return Action.prototype.listen.call( this, fn, bindCtx );
        } } );
        Object.defineProperty( functor, 'listenOnce', { value: ( fn, bindCtx ) => {
            return Action.prototype.listenOnce.call( this, fn, bindCtx );
        } } );

        Object.keys( this.children ).forEach( ( childName ) => {
            Object.defineProperty( functor, childName, { value: this.children[ childName ].asFunction } );
        });

        Object.defineProperty( functor, 'completed', { value: this.children.completed.asFunction } );
        Object.defineProperty( functor, 'failed', { value: this.children.failed.asFunction } );

        return functor;
    }

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise( ...args: Array< any > ) : Promise< T > {
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

    get eventLabel() : string { return 'event'; }
    get isAction()  : boolean { return true; }
}




const t = new AsyncResultAction( ( t: string ) => Promise.resolve( 5  ) ).asFunction;
t();
