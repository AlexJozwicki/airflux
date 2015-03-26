"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Store = require("./Store");

function joinClassFactory(join) {
    return (function (_Store) {
        var _class = function () {
            _classCallCheck(this, _class);

            _get(Object.getPrototypeOf(_class.prototype), "constructor", this).call(this);

            var listenables = [].concat(_slice.call(arguments), ["trigger"]);
            this[join].apply(this, listenables);
        };

        _inherits(_class, _Store);

        return _class;
    })(Store);
}

var JoinStrictStore = joinClassFactory("joinStrict");
var JoinLeadingStore = joinClassFactory("joinLeading");
var JoinTrailingStore = joinClassFactory("joinTrailing");
var JoinConcatStore = joinClassFactory("joinConcat");

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