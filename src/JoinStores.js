/* @flow */
import Store from './Store';


function joinClassFactory( join: string ) {
    return class extends Store {
        constructor() {
            super();

            var listenables = [ ...arguments, 'trigger' ];
            this[ join ]( ...listenables );
        }
    };
}


var JoinStrictStore     = joinClassFactory( 'joinStrict' );
var JoinLeadingStore    = joinClassFactory( 'joinLeading' );
var JoinTrailingStore   = joinClassFactory( 'joinTrailing' );
var JoinConcatStore     = joinClassFactory( 'joinConcat' );


export function joinStrict()    { return new JoinStrictStore( ...arguments ) };
export function joinLeading()   { return new JoinLeadingStore( ...arguments ); };
export function all()           { return new JoinTrailingStore( ...arguments ); };
export function joinTrailing()  { return new JoinTrailingStore( ...arguments ); };
export function joinConcat()    { return new JoinConcatStore( ...arguments ); };
