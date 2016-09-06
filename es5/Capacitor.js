'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _class;

// airflux

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _FluxComponent = require('./FluxComponent');

var _FluxComponent2 = _interopRequireDefault(_FluxComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 */

var Capacitor = (0, _FluxComponent2.default)(_class = (function (_React$Component) {
    _inherits(Capacitor, _React$Component);

    _createClass(Capacitor, [{
        key: 'listenTo',
        value: function listenTo(publisher, callback) {}
    }, {
        key: 'connectStore',
        value: function connectStore(store, stateKey) {}
    }]);

    function Capacitor(props) {
        _classCallCheck(this, Capacitor);

        //        ( this: FluxListener );

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Capacitor).call(this, props));

        _this.state = {};
        Object.keys(props).filter(function (key) {
            return key != 'children' && typeof props[key].listen === 'function';
        }).forEach(function (key) {
            return _this.connectStore(props[key], key);
        });
        return _this;
    }

    _createClass(Capacitor, [{
        key: 'render',
        value: function render() {
            (0, _invariant2.default)(_react2.default.Children.count(this.props.children) == 1, 'Capacitor should only have one child');
            return _react2.default.cloneElement(_react2.default.Children.only(this.props.children), this.state);
        }
    }]);

    return Capacitor;
})(_react2.default.Component)) || _class;

exports.default = Capacitor;