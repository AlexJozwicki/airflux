'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Listener2 = require('./Listener');

var _Listener3 = _interopRequireDefault(_Listener2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 */

var Store = (function (_Listener) {
    _inherits(Store, _Listener);

    function Store() {
        _classCallCheck(this, Store);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));
    }

    _createClass(Store, [{
        key: 'publishState',

        /**
         * Publishes the state to all subscribers.
         * This ensures that the stores always publishes the same data/signature.
         */
        value: function publishState() {
            _get(Object.getPrototypeOf(Store.prototype), 'trigger', this).call(this, this.state);
        }
    }, {
        key: 'setState',
        value: function setState(partialState, callback) {
            this.state = _extends({}, this.state, { partialState: partialState });
            this.publishState();
            if (typeof callback === 'function') {
                callback();
            }
        }
    }, {
        key: 'eventLabel',
        get: function get() {
            return 'change';
        }
    }]);

    return Store;
})(_Listener3.default);

exports.default = Store;