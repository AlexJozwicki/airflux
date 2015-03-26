var Store = require("./Store");


function joinClassFactory( join ) {
    return class extends Store {
        constructor() {
            super();

            var listenables = [ ...arguments, 'trigger' ];
            this[join]( ...listenables );
        }
    };
}


var JoinStrictStore     = joinClassFactory( 'joinStrict' );
var JoinLeadingStore    = joinClassFactory( 'joinLeading' );
var JoinTrailingStore   = joinClassFactory( 'joinTrailing' );
var JoinConcatStore     = joinClassFactory( 'joinConcat' );


module.exports = {
    JoinStrict  : function() { return new JoinStrictStore( ...arguments ); },
    JoinLeading : function() { return new JoinLeadingStore( ...arguments ); },
    JoinTrailing: function() { return new JoinTrailingStore( ...arguments ); },
    JoinConcat  : function() { return new JoinConcatStore( ...arguments ); }
};
