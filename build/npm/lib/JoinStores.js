"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Store = require("./Store");

var JoinStrictStore = (function (_Store) {
    function JoinStrictStore() {
        _classCallCheck(this, JoinStrictStore);

        _get(Object.getPrototypeOf(JoinStrictStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinStrict.apply(this, listenables);
    }

    _inherits(JoinStrictStore, _Store);

    return JoinStrictStore;
})(Store);

var JoinLeadingStore = (function (_Store2) {
    function JoinLeadingStore() {
        _classCallCheck(this, JoinLeadingStore);

        _get(Object.getPrototypeOf(JoinLeadingStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinLeading.apply(this, listenables);
    }

    _inherits(JoinLeadingStore, _Store2);

    return JoinLeadingStore;
})(Store);

var JoinTrailingStore = (function (_Store3) {
    function JoinTrailingStore() {
        _classCallCheck(this, JoinTrailingStore);

        _get(Object.getPrototypeOf(JoinTrailingStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinTrailing.apply(this, listenables);
    }

    _inherits(JoinTrailingStore, _Store3);

    return JoinTrailingStore;
})(Store);

var JoinConcatStore = (function (_Store4) {
    function JoinConcatStore() {
        _classCallCheck(this, JoinConcatStore);

        _get(Object.getPrototypeOf(JoinConcatStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinConcat.apply(this, listenables);
    }

    _inherits(JoinConcatStore, _Store4);

    return JoinConcatStore;
})(Store);

module.exports = {
    JoinStrict: function JoinStrict() {
        return _applyConstructor(JoinStrictStore, _slice.call(arguments));
    },
    JoinLeading: function JoinLeading() {
        return _applyConstructor(JoinLeadingStore, _slice.call(arguments));
    },
    JoinTrailing: function JoinTrailing() {
        return _applyConstructor(JoinTrailingStore, _slice.call(arguments));
    },
    JoinConcat: function JoinConcat() {
        return _applyConstructor(JoinConcatStore, _slice.call(arguments));
    }
};