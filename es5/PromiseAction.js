'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _AsyncResultAction2 = require('./AsyncResultAction');

var _AsyncResultAction3 = _interopRequireDefault(_AsyncResultAction2);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @example
 *   new PromiseAction( () => fetch( '/url' ) )
 */

var PromiseAction = (function (_AsyncResultAction) {
    _inherits(PromiseAction, _AsyncResultAction);

    function PromiseAction(listenFunction) {
        _classCallCheck(this, PromiseAction);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(PromiseAction).call(this, listenFunction));
    }

    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */

    _createClass(PromiseAction, [{
        key: 'processResult',
        value: function processResult(promise) {
            var _this2 = this;

            if (!(promise instanceof Promise)) return;
            promise.then(function () {
                var _completed;

                return (_completed = _this2.completed).trigger.apply(_completed, arguments);
            }).catch(function () {
                var _failed;

                return (_failed = _this2.failed).asFunction.apply(_failed, arguments);
            });
        }
    }, {
        key: 'asFunction',
        get: function get() {
            return this.createFunctor(this.triggerPromise);
        }
    }]);

    return PromiseAction;
})(_AsyncResultAction3.default);

exports.default = PromiseAction;