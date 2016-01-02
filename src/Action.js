/* @flow */
import Publisher from './Publisher';
import type { Functor } from './Publisher';



/**
 * @abstract
 */
export default class Action extends Publisher {
    constructor( sync: boolean = false ) {
        super();
        this.children = {};
    }


    /**
     * Transforms the action into one returning an asynchronous result.
     * This will create two children actions:
     * - completed
     * - failed
     *
     * If the listen function returns a Promise, the Promise will be automatically mapped onto these two children actions.
     */
    asyncResult( listenFunction: ?Function = void 0 ) {
        this.children.completed = new Action();
        Object.defineProperty( this, 'completed', { value: this.children.completed } );

        this.children.failed = new Action();
        Object.defineProperty( this, 'failed', { value: this.children.failed } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }

        return this;
    }


    /**
     * Creates children actions
     */
    withChildren( children ) {
        children.forEach( ( child ) => {
            if( typeof child === 'string' ) {
                let action = new Action();
                this.children[ child ] = action;
                Object.defineProperty( this, child, { value: action } );
            }
            else if( Array.isArray( child ) && typeof child[0] === 'string' && child[1] instanceof Action ) {
                let name = child[ 0 ];
                this.children[ name ] = child[ 1 ];
                Object.defineProperty( this, name, { value: child[ 1 ] } );
            }
        });
        return this;
    }


    /**
     * Returns a synchronous function to trigger the action
     */
    get asSyncFunction() : Functor {
        return this._createFunctor( true );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Functor {
        return this._createFunctor( this.sync );
    }




    /**
     *
     */
    _createFunctor( sync: boolean = false ) : Functor {
        const trigger = sync ? this.triggerSync : this.triggerPromise;
        var functor = trigger.bind( this );

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


        return functor;
    }

    get eventType() : string { return 'event'; }
    get isAction()  : boolean { return true; }
}
