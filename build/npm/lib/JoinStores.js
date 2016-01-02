'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = require("./Store");

function joinClassFactory(join) {
    return (function (_Store) {
        _inherits(_class, _Store);

        function _class() {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this));

            var listenables = ['trigger'].concat(Array.prototype.slice.call(arguments));
            _this[join].apply(_this, _toConsumableArray(listenables));
            return _this;
        }

        return _class;
    })(Store);
}

var JoinStrictStore = joinClassFactory('joinStrict');
var JoinLeadingStore = joinClassFactory('joinLeading');
var JoinTrailingStore = joinClassFactory('joinTrailing');
var JoinConcatStore = joinClassFactory('joinConcat');

module.exports = {
    JoinStrict: function JoinStrict() {
        return new (Function.prototype.bind.apply(JoinStrictStore, [null].concat(Array.prototype.slice.call(arguments))))();
    },
    JoinLeading: function JoinLeading() {
        return new (Function.prototype.bind.apply(JoinLeadingStore, [null].concat(Array.prototype.slice.call(arguments))))();
    },
    JoinTrailing: function JoinTrailing() {
        return new (Function.prototype.bind.apply(JoinTrailingStore, [null].concat(Array.prototype.slice.call(arguments))))();
    },
    JoinConcat: function JoinConcat() {
        return new (Function.prototype.bind.apply(JoinConcatStore, [null].concat(Array.prototype.slice.call(arguments))))();
    }
};