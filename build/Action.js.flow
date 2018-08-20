/* @flow */
import Publisher                    from './Publisher';
import type { UnsubscribeFunction } from './Publisher';


export interface ActionFunctor< Fn > {
    _isActionFunctor    : boolean;
    action              : Action< Fn >;
    listen              : ( callback: ( x: any ) => ?Promise< * > ) => any;
    listenOnce          : ( callback: ( x: any ) => ?Promise< * > ) => any;
};

type Children = { [key: string]: Action< * > };



/**
 *
 */
export default class Action< Fn > extends Publisher {
    children    : Children;

    /** Whether or not the triggering of the action is synchronous or at the next tick. */
    _sync       : boolean;

    constructor( sync?: boolean = false  ) {
        super();
        this.children = {};
        this._sync  = sync;
    }

    /**
     * Creates children actions
     */
    withChildren( children: Array< Children | string > ) : Action< Fn > {
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
    get asSyncFunction() : Fn {
        return this.createFunctor( this.triggerSync );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Fn {
        return this.createFunctor( this._sync ? this.triggerSync : this.trigger );
    }


    get exec() : Fn {
        return this.asFunction;
    }

    /**
      * Creates a new action, that will be triggered only if the filter passes.
      */
    filter( filterFn: ( ...args: any[] ) => boolean ): Action< Fn > {
        const filteredAction = new Action();

        this.listen( ( ...args: any[] ) => {
            if( filterFn( ...args ) ) filteredAction.trigger( ...args )
        } );

        return filteredAction;
    }


    /**
     *
     */
    createFunctor( triggerFn: Function ) : any /* ( Fn & ActionFunctor< Fn > )*/ {
        var functor = triggerFn.bind( this );

        Object.defineProperty( functor, '_isActionFunctor', { value: true } );
        Object.defineProperty( functor, 'action', { value: this } );
        Object.defineProperty( functor, 'listen', { value: ( fn ) => {
            return Action.prototype.listen.call( this, fn );
        } } );
        Object.defineProperty( functor, 'listenOnce', { value: ( fn ) => {
            return Action.prototype.listenOnce.call( this, fn );
        } } );

        Object.keys( this.children ).forEach( ( childName ) => {
            Object.defineProperty( functor, childName, { value: this.children[ childName ].asFunction } );
        });

        // $IgnoreFlow
        return functor;
    }

    get eventLabel() : string { return 'event'; }
    get isAction()  : boolean { return true; }
}
