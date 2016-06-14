'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.joinStrict = joinStrict;
exports.joinLeading = joinLeading;
exports.all = all;
exports.joinTrailing = joinTrailing;
exports.joinConcat = joinConcat;

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function joinClassFactory(strategy) {
    var store = new _Store2.default();

    // TODO: when flow supports :: syntax, switch to it
    // $FlowComputedProperty

    for (var _len = arguments.length, listenables = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        listenables[_key - 1] = arguments[_key];
    }

    store[strategy].apply(store, [store.trigger.bind(store)].concat(listenables));
    return store;
}

function joinStrict() {
    return joinClassFactory.apply(undefined, ['joinStrict'].concat(Array.prototype.slice.call(arguments)));
};
function joinLeading() {
    return joinClassFactory.apply(undefined, ['joinLeading'].concat(Array.prototype.slice.call(arguments)));
};
function all() {
    return joinClassFactory.apply(undefined, ['joinTrailing'].concat(Array.prototype.slice.call(arguments)));
};
function joinTrailing() {
    return joinClassFactory.apply(undefined, ['joinTrailing'].concat(Array.prototype.slice.call(arguments)));
};
function joinConcat() {
    return joinClassFactory.apply(undefined, ['joinConcat'].concat(Array.prototype.slice.call(arguments)));
};