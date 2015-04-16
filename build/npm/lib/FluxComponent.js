"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = require("react");
var Listener = require("./Listener");

/**
 * A component that is wired on Airflux or Reflux stores.
 */

var FluxComponent = (function (_React$Component) {
    function FluxComponent(props, listenables) {
        _classCallCheck(this, FluxComponent);

        _get(Object.getPrototypeOf(FluxComponent.prototype), "constructor", this).call(this, props);
        this.state = {};
        this.listenables = listenables;
        this._listener = new Listener();

        for (var key in this.listenables) {
            var listenable = this.listenables[key];
            if (typeof this[key] !== "function") this.state[key] = listenable.state;
        }
    }

    _inherits(FluxComponent, _React$Component);

    _createClass(FluxComponent, {
        areStoresConnected: {

            /**
             * Checks whether every stores have returned a value
             * @private
             * @return {Boolean}
             */

            value: function areStoresConnected() {
                var res = true;
                for (var key in this.listenables) {
                    res = res && this.state[key];
                }
                return res;
            }
        },
        componentDidMount: {

            /**
             * Listen to all stores
             */

            value: function componentDidMount() {
                var _this = this;

                var thisComponent = this;
                for (var k in this.listenables) {
                    (function () {
                        var key = k;
                        var listenable = _this.listenables[key];
                        var callback = _this[key];

                        if (typeof callback === "function") {
                            _this._listener.listenTo(listenable, function () {
                                callback.apply(thisComponent, arguments);
                            });
                        } else {
                            _this._listener.listenTo(listenable, function (value) {
                                return _this.setState(_defineProperty({}, key, value));
                            });
                        }
                    })();
                }
            }
        },
        componentWillUnmount: {

            /**
             * Unregister from the stores
             */

            value: function componentWillUnmount() {
                this._listener.stopListeningToAll();
            }
        }
    });

    return FluxComponent;
})(React.Component);

module.exports = FluxComponent;