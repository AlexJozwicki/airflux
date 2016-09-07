'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _utils = require('./utils');

var _ = _interopRequireWildcard(_utils);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class of everything.
 * - actions are a directly subclass
 * - stores are inheriting from Listener
 */

var Publisher = (function () {

    /**
     * @protected
     */

    function Publisher() {
        _classCallCheck(this, Publisher);

        this.emitter = new _.EventEmitter();
    }

    _createClass(Publisher, [{
        key: 'preEmit',

        /**
         * Hook used by the publisher that is invoked before emitting
         * and before `shouldEmit`. The arguments are the ones that the action
         * is invoked with. If this function returns something other than
         * undefined, that will be passed on as arguments for shouldEmit and
         * emission.
         */
        value: function preEmit(args) {}

        /**
         * Hook used by the publisher after `preEmit` to determine if the
         * event should be emitted with given arguments. This may be overridden
         * in your application, default implementation always returns true.
         *
         * @returns {Boolean} true if event should be emitted
         */

    }, {
        key: 'shouldEmit',
        value: function shouldEmit() {
            return true;
        }

        /**
         * @abstract
         */

    }, {
        key: 'processResult',
        value: function processResult(result) {}

        /**
         * Subscribes the given callback for action triggered
         *
         * @param {( x: any ) => ?any} callback The callback to register as event handler
         * @returns {UnsubscribeFunction} Callback that unsubscribes the registered event handler
         */

    }, {
        key: 'listen',
        value: function listen(callback) {
            var _this = this;

            (0, _invariant2.default)(typeof callback === 'function', 'listen has to be given a valid callback function');

            var aborted = false;

            var eventHandler = function eventHandler(args) {
                if (aborted) return;
                _this.processResult(callback.apply(_this, args));
            };

            this.emitter.addListener(this.eventLabel, eventHandler);

            return function () {
                aborted = true;
                _this.emitter.removeListener(_this.eventLabel, eventHandler);
            };
        }
    }, {
        key: 'listenOnce',
        value: function listenOnce(callback) {
            var _this2 = this;

            (0, _invariant2.default)(typeof callback === 'function', 'listenOnce has to be given a valid callback function');

            var unsubscribe = this.listen(function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                unsubscribe();
                return callback.apply(_this2, args);
            });
            return unsubscribe;
        }

        /**
         * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
         */

    }, {
        key: 'triggerSync',
        value: function triggerSync() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var preResult = this.preEmit.apply(this, args);
            if (typeof preResult !== 'undefined') {
                args = _.isArguments(preResult) ? preResult : [].concat(preResult);
            }

            if (!this.shouldEmit.apply(this, args)) return;

            this.emitter.emit(this.eventLabel, args);
        }

        /**
         * Tries to publish the event on the next tick
         */

    }, {
        key: 'trigger',
        value: function trigger() {
            var _this3 = this;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            _.nextTick(function () {
                return _this3.triggerSync.apply(_this3, args);
            });
        }
    }, {
        key: 'eventLabel',
        get: function get() {
            return 'event';
        }
    }, {
        key: 'isPublisher',
        get: function get() {
            return true;
        }
    }]);

    return Publisher;
})();

exports.default = Publisher;