/* @flow */

/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
export function isObject( obj: Object | any ): boolean {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

export function isFunction( value: Function | any ) {
    return typeof value === 'function';
};

export function isArguments( value: Object | any ): boolean {
    return typeof value === 'object' && ('callee' in value) && typeof value.length === 'number';
};
