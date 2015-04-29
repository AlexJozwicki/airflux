"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = require("react");
var FluxComponent = require("./FluxComponent");

/**
 * A component that is wired on Airflux or Reflux stores.
 */

var FluxConnection = (function (_FluxComponent) {
    function FluxConnection(props) {
        _classCallCheck(this, FluxConnection);

        _get(Object.getPrototypeOf(FluxConnection.prototype), "constructor", this).call(this, props, props.stores || {});
    }

    _inherits(FluxConnection, _FluxComponent);

    _createClass(FluxConnection, {
        injectStores: {
            value: function injectStores(component) {
                return React.cloneElement(component, this.state);
            }
        },
        render: {
            value: function render() {
                var _this = this;

                if (React.Children.count(this.props.children) === 0) {
                    return this.injectStores(React.Children.only(this.props.children));
                } else {
                    return React.createElement(
                        "span",
                        null,
                        React.Children.map(this.props.children, function (child) {
                            return _this.injectStores(child);
                        })
                    );
                }
            }
        }
    });

    return FluxConnection;
})(FluxComponent);

module.exports = FluxConnection;