/* @flow */
import Publisher from './Publisher';

export type Functor = Function;

type Children = { [key: string]: Action };


/**
 * @abstract
 */
export default class Action extends Publisher {
    children    : Children;

    constructor() {
        super();
        this.children = {};
    }

    get sync() : boolean { return false; }




    /**
     * Creates children actions
     */
    withChildren( children: Array< Children | string > ) : Action {
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
        return this.createFunctor( this.triggerSync );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Functor {
        return this.createFunctor( this.trigger );
    }


    /**
     *
     */
    createFunctor( triggerFn: Function ) : Functor {
        var functor = triggerFn.bind( this );

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
