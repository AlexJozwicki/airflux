/* @flow */
import Store from './Store';


function joinClassFactory( strategy: string, ...listenables ) : Store {
    var store = new Store();

    // TODO: when flow supports :: syntax, switch to it
    // $FlowComputedProperty
    store[ strategy ]( store.trigger.bind( store ), ...listenables );
    return store;
}

export function joinStrict() : Store    { return joinClassFactory( 'joinStrict', ...arguments ) };
export function joinLeading() : Store   { return joinClassFactory( 'joinLeading', ...arguments ); };
export function all() : Store           { return joinClassFactory( 'joinTrailing', ...arguments ); };
export function joinTrailing() : Store  { return joinClassFactory( 'joinTrailing', ...arguments ); };
export function joinConcat() : Store    { return joinClassFactory( 'joinConcat', ...arguments ); };
