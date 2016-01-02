'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var FluxComponent = require('./FluxComponent');

/**
 * A component that is wired on Airflux or Reflux stores.
 */

var FluxConnection = (function (_FluxComponent) {
    _inherits(FluxConnection, _FluxComponent);

    function FluxConnection(props) {
        _classCallCheck(this, FluxConnection);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FluxConnection).call(this, props, props.stores || {}));
    }

    _createClass(FluxConnection, [{
        key: 'injectStores',
        value: function injectStores(component) {
            return React.cloneElement(component, this.state);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (React.Children.count(this.props.children) === 0) {
                return this.injectStores(React.Children.only(this.props.children));
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.Children.map(this.props.children, function (child) {
                        return _this2.injectStores(child);
                    })
                );
            }
        }
    }]);

    return FluxConnection;
})(FluxComponent);

module.exports = FluxConnection;