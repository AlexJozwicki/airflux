var Action = require( './Action' );

class SimpleAction extends Action {
    constructor( sync = false ) {
        super( sync );
        return this.asFunction;
    }
}

module.exports = SimpleAction;
