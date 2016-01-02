'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var Listener = require('./Listener');

/**
 * A component that is wired on Airflux or Reflux stores.
 */

var FluxComponent = (function (_React$Component) {
    _inherits(FluxComponent, _React$Component);

    function FluxComponent(props, listenables) {
        _classCallCheck(this, FluxComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FluxComponent).call(this, props));

        _this.state = {};
        _this.listenables = listenables;
        _this._listener = new Listener();

        for (var key in _this.listenables) {
            var listenable = _this.listenables[key];
            if (typeof _this[key] !== 'function') _this.state[key] = listenable.state;
        }
        return _this;
    }

    /**
     * Checks whether every stores have returned a value
     * @private
     * @return {Boolean}
     */

    _createClass(FluxComponent, [{
        key: 'areStoresConnected',
        value: function areStoresConnected() {
            var res = true;
            for (var key in this.listenables) {
                res = res && this.state[key];
            }
            return res;
        }

        /**
         * Listen to all stores
         */

    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var thisComponent = this;

            var _loop = function _loop() {
                var key = k;
                var listenable = _this2.listenables[key];
                var callback = _this2[key];

                if (typeof callback === 'function') {
                    _this2._listener.listenTo(listenable, function () {
                        callback.apply(thisComponent, arguments);
                    });
                } else {
                    _this2._listener.listenTo(listenable, function (value) {
                        return _this2.setState(_defineProperty({}, key, value));
                    });
                }
            };

            for (var k in this.listenables) {
                _loop();
            }
        }

        /**
         * Unregister from the stores
         */

    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._listener.stopListeningToAll();
        }
    }]);

    return FluxComponent;
})(React.Component);

module.exports = FluxComponent;