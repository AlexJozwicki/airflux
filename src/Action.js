var Publisher = require( './Publisher' );



/**
 *
 */
class Action extends Publisher {
    /*:: asyncResult    : boolean; */
    /*:: children       : Array< any >; */
    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

    constructor( sync/*:boolean*/ = false ) {
        super();

        Object.defineProperty( this, 'sync', { value: sync } );
    }

    asyncResult( listenFunction = void 0 ) {
        Object.defineProperty( this, 'completed', { value: new Action() } );
        Object.defineProperty( this, 'failed', { value: new Action() } );

        if( listenFunction ) {
            this.listen( listenFunction );
        }

        return this;
    }

    withChildren( children ) {
        children.forEach( ( childName ) => Object.defineProperty( this, childName, { value: new Action() } ) );
        return this;
    }

    get asFunction() {
        var trigger = this.sync ? this.triggerSync : this.trigger;
        var functor = trigger.bind( this );

        Object.defineProperty( functor, 'action', { value: this } );
        Object.defineProperty( functor, 'listen', { value: ( fn ) => {
            return Action.prototype.listen.call( this, fn );
        } } );
        Object.defineProperty( functor, 'trigger', { value: ( fn ) => {
            return Action.prototype.trigger.call( this, fn );
        } } );
        Object.defineProperty( functor, 'triggerSync', { value: ( fn ) => {
            return Action.prototype.triggerSync.call( this, fn );
        } } );


        return functor;
    }

    get eventType() /*:string*/ { return 'event'; }
    get isAction()  /*:boolean*/ { return true; }
}


module.exports = Action;
