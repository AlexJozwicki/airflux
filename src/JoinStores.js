var Store = require("./Store");


class JoinStrictStore extends Store {
    constructor() {
        super();

        var listenables = [ ...arguments, 'trigger' ];
        this.joinStrict( ...listenables );
    }
}

class JoinLeadingStore extends Store {
    constructor() {
        super();

        var listenables = [ ...arguments, 'trigger' ];
        this.joinLeading( ...listenables );
    }
}

class JoinTrailingStore extends Store {
    constructor() {
        super();

        var listenables = [ ...arguments, 'trigger' ];
        this.joinTrailing( ...listenables );
    }
}

class JoinConcatStore extends Store {
    constructor() {
        super();

        var listenables = [ ...arguments, 'trigger' ];
        this.joinConcat( ...listenables );
    }
}


module.exports = {
    JoinStrict  : function() { return new JoinStrictStore( ...arguments ); },
    JoinLeading : function() { return new JoinLeadingStore( ...arguments ); },
    JoinTrailing: function() { return new JoinTrailingStore( ...arguments ); },
    JoinConcat  : function() { return new JoinConcatStore( ...arguments ); }
};
