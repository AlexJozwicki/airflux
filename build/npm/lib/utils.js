'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function (obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
};

exports.isFunction = function (value) {
    return typeof value === 'function';
};

exports.isPromise = function (value) {
    return value && ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'function') && typeof value.then === 'function';
};

exports.EventEmitter = require('eventemitter3');

exports.nextTick = function (callback) {
    setTimeout(callback, 0);
};

exports.capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.callbackName = function (string) {
    return "on" + exports.capitalize(string);
};

exports.object = function (keys, vals) {
    var o = {},
        i = 0;
    for (; i < keys.length; i++) {
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.isArguments = function (value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && 'callee' in value && typeof value.length === 'number';
};

exports.throwIf = function (val, msg) {
    if (val) {
        throw Error(msg || val);
    }
};