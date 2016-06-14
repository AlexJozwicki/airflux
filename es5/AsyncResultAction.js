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

    function AsyncResultAction(listenFunction) {
        _classCallCheck(this, AsyncResultAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AsyncResultAction).call(this));

        _this.children.completed = new _Action3.default();
        _this.children.failed = new _Action3.default();

        Object.defineProperty(_this, 'completed', { value: _this.children.completed });
        Object.defineProperty(_this, 'failed', { value: _this.children.failed });

        if (typeof listenFunction === 'function') {
            _this.listen(listenFunction);
        }
        return _this;
    }

    /**
     * Returns a Promise for the triggered action
     */

    _createClass(AsyncResultAction, [{
        key: 'triggerPromise',
        value: function triggerPromise() {
            var _this2 = this;

            var args = arguments;

            var promise = new Promise(function (resolve, reject) {
                var removeSuccess = _this2.completed.listen(function (args) {
                    removeSuccess();
                    removeFailed();
                    resolve(args);
                });

                var removeFailed = _this2.failed.listen(function (args) {
                    removeSuccess();
                    removeFailed();
                    reject(args);
                });

                _this2.trigger.apply(_this2, args);
            });

            return promise;
        }
    }]);

    return AsyncResultAction;
})(_Action3.default);

exports.default = AsyncResultAction;