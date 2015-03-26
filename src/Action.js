var Publisher = require( './Publisher' );


/**
 *
 */
class Action extends Publisher {
    /*:: asyncResult    : boolean; */
    /*:: children       : Array< any >; */
    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

    constructor( definition = {} ) {
        super();

        this.asyncResult = !!definition.asyncResult;

        this.children = definition.children || [];
        if (this.asyncResult) {
            this.children.push('completed', 'failed');
        }

        if( definition.preEmit ) {
            this.preEmit = definition.preEmit;
        }
        if( definition.shouldEmit ) {
            this.shouldEmit = definition.shouldEmit;
        }

        this.createChildActions();

        var trigger = definition.sync ? this.triggerSync : this.trigger;
        var functor = trigger.bind(this);
        functor.__proto__ = this;

        return functor;
    }

    get eventType()/*:string*/ { return 'event'; }
    get isAction()/*:boolean*/ { return true; }


    /**
     * @protected
     */
    createChildActions() {
        this.children.forEach( ( childName ) => this[childName] = new Action({ actionType: childName }) );
    }
}


module.exports = Action;
