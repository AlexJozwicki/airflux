var Publisher = require( './Publisher' );



/**
 *
 */
class Action extends Publisher {
    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

    constructor( sync/*:boolean*/ = false ) {
        super();

        Object.defineProperty( this, 'sync', { value: sync } );
    }


    /**
     * Transforms the action into one returning an asynchronous result.
     * This will create two children actions:
     * - completed
     * - failed
     *
     * If the listen function returns a Promise, the Promise will be automatically mapped onto these two children actions.
     */
    asyncResult( listenFunction = void 0 ) {
        Object.defineProperty( this, 'completed', { value: new Action( false ).asFunction } );
        Object.defineProperty( this, 'failed', { value: new Action( false ).asFunction } );

        if( typeof listenFunction === 'function' ) {
            this.listen( listenFunction );
        }

        return this;
    }


    /**
     * Creates children actions
     */
    withChildren( children ) {
        children.forEach( ( childName ) => Object.defineProperty( this, childName, { value: new Action().asFunction } ) );
        return this;
    }


    /**
     * Returns a synchronous function to trigger the action
     */
    get asSyncFunction() {
        return this._createFunctor( true );
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() {
        return this._createFunctor( this.sync );
    }




    /**
     *    
     */
    _createFunctor( sync = false ) {
        var trigger = sync ? this.triggerSync : this.trigger;
        var functor = trigger.bind( this );

        Object.defineProperty( functor, '_isActionFunctor', { value: true } );
        Object.defineProperty( functor, 'action', { value: this } );
        Object.defineProperty( functor, 'listen', { value: ( fn, bindCtx ) => {
            return Action.prototype.listen.call( this, fn, bindCtx );
        } } );
        Object.defineProperty( functor, 'listenOnce', { value: ( fn, bindCtx ) => {
            return Action.prototype.listenOnce.call( this, fn, bindCtx );
        } } );


        return functor;
    }

    get eventType() /*:string*/ { return 'event'; }
    get isAction()  /*:boolean*/ { return true; }
}


module.exports = Action;
