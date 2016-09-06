'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Action2 = require('./Action');

var _Action3 = _interopRequireDefault(_Action2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AsyncResultAction = (function (_Action) {
    _inherits(AsyncResultAction, _Action);

    //_listenFunction : Fn;

    /**
     * By default we create this type of action as synchronous.
     * If the action is returning a Promise, it's safe to consider that most of the time the action itself is quite simple,
     * and therefore doesn't necessitate to be async.
     */

    function AsyncResultAction(listenFunction) {
        var sync = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        _classCallCheck(this, AsyncResultAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AsyncResultAction).call(this, sync));

        _this.children.completed = new _Action3.default();
        _this.children.failed = new _Action3.default();
        //this._listenFunction = listenFunction;

        Object.defineProperty(_this, 'completed', { value: _this.children.completed });
        Object.defineProperty(_this, 'failed', { value: _this.children.failed });

        if (typeof listenFunction === 'function') {
            _this.listen(listenFunction);
        }
        return _this;
    }

    _createClass(AsyncResultAction, [{
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

        /**
         * Returns a Promise for the triggered action
         */

    }, {
        key: 'triggerPromise',
        value: function triggerPromise() {
            var _this3 = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var promise = new Promise(function (resolve, reject) {
                var removeSuccess = _this3.completed.listen(function (args) {
                    removeSuccess();
                    removeFailed();
                    resolve(args);
                });

                var removeFailed = _this3.failed.listen(function (args) {
                    removeSuccess();
                    removeFailed();
                    reject(args);
                });

                _this3.trigger.apply(_this3, args);
            });

            return promise;
        }
    }, {
        key: 'asFunction',
        get: function get() {
            return this.createFunctor(this.triggerPromise);
        }
    }]);

    return AsyncResultAction;
})(_Action3.default);

exports.default = AsyncResultAction;