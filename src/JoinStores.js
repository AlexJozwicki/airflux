/* @flow */
import Store from './Store';


function joinClassFactory( strategy: string, ...listenables ) : Store< void > {
    var store = new Store();

    // TODO: when flow supports :: syntax, switch to it
    // $FlowComputedProperty
    store[ strategy ]( store.trigger.bind( store ), ...listenables );
    return store;
}

export function joinStrict() : Store< void >    { return joinClassFactory( 'joinStrict', ...arguments ) };
export function joinLeading() : Store< void >   { return joinClassFactory( 'joinLeading', ...arguments ); };
export function all() : Store< void >           { return joinClassFactory( 'joinTrailing', ...arguments ); };
export function joinTrailing() : Store< void >  { return joinClassFactory( 'joinTrailing', ...arguments ); };
export function joinConcat() : Store< void >    { return joinClassFactory( 'joinConcat', ...arguments ); };
