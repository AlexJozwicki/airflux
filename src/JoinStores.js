/* @flow */
import Store from './Store';


function joinClassFactory( join: string ) {
    return class extends Store {
        constructor() {
            super();

            var listenables = [ 'trigger', ...arguments ];
            this[join]( ...listenables );
        }
    };
}


var JoinStrictStore     = joinClassFactory( 'joinStrict' );
var JoinLeadingStore    = joinClassFactory( 'joinLeading' );
var JoinTrailingStore   = joinClassFactory( 'joinTrailing' );
var JoinConcatStore     = joinClassFactory( 'joinConcat' );


export function JoinStrict() { return new JoinStrictStore( ...arguments );
export function JoinLeading() { return new JoinLeadingStore( ...arguments ); },
export function JoinTrailing() { return new JoinTrailingStore( ...arguments ); },
export function JoinConcat() { return new JoinConcatStore( ...arguments ); }
