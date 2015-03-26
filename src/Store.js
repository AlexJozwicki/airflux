var Listener = require('./Listener');



/**
 */
class Store extends Listener {
    constructor() {
        super();
    }

    get eventType()/*:string*/ { return 'change'; }

    /**
     * Publishes the state to all subscribers.
     * This ensures that the stores always publishes the same data/signature.
     */
    publishState() {
        super.trigger( this.state );
    }
}

module.exports = Store;
