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

var _Publisher2 = require('./Publisher');

var _Publisher3 = _interopRequireDefault(_Publisher2);

var _Join = require('./Join');

var _Join2 = _interopRequireDefault(_Join);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A module of methods related to listening.
 * @constructor
 * @extends {Publisher}
 */

var Listener = (function (_Publisher) {
    _inherits(Listener, _Publisher);

    function Listener() {
        _classCallCheck(this, Listener);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Listener).call(this));

        _this._subscriptions = [];
        return _this;
    }

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Publisher} listenable The listenable we want to search for
     * @returns {boolean} The result of a recursive search among `this._subscriptions`
     */

    _createClass(Listener, [{
        key: 'hasListener',
        value: function hasListener(listenable) {
            var pubs = this._subscriptions.reduce(function (r, sub) {
                return r.concat(sub.listenable);
            }, []);

            // TODO: replace by .find one day, with a polyfill
            return pubs.filter(function (pub) {
                return pub === listenable || pub.hasListener && pub.hasListener(listenable);
            }).length > 0;
        }

        /**
         * Checks if the current context can listen to the supplied listenable
         *
         * @param {Publisher} listenable An Action or Store that should be listened to.
         */

    }, {
        key: 'validateListening',
        value: function validateListening(listenable) {
            (0, _invariant2.default)(listenable !== this, 'Listener is not able to listen to itself');
            (0, _invariant2.default)(typeof listenable.listen === 'function', 'listenable should be a Publisher');
            (0, _invariant2.default)(!(listenable.hasListener && listenable.hasListener(this)), 'Listener cannot listen to this listenable because of circular loop');
        }

        /**
         * Sets up a subscription to the given listenable for the context object
         *
         * @param {Publisher} listenable An Action or Store that should be listened to.
         * @param {Function} callback The callback to register as event handler
         * @param {Function} defaultCallback The callback to register as default handler
         *
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
         */

    }, {
        key: 'listenTo',
        value: function listenTo(listenable, callback, defaultCallback) {
            var _this2 = this;

            this.validateListening(listenable);
            (0, _invariant2.default)(callback != null, 'listenTo should be called with a valid callback');

            if (!!defaultCallback) this.fetchInitialState(listenable, defaultCallback);

            var desub = listenable.listen(callback.bind(this));
            var unsubscriber = function unsubscriber() {
                var index = _this2._subscriptions.indexOf(subscriptionObj);
                (0, _invariant2.default)(index >= 0, 'Tried to remove listen already gone from subscriptions list!');
                _this2._subscriptions.splice(index, 1);
                desub();
            };

            var subscriptionObj = this.addSubscription(unsubscriber, listenable);
            return subscriptionObj;
        }

        /**
         * Stops listening to a single listenable
         *
         * @param {Publisher} listenable The action or store we no longer want to listen to
         * @returns {boolean} True if a subscription was found and removed, otherwise false.
         */

    }, {
        key: 'stopListeningTo',
        value: function stopListeningTo(listenable) {
            var subs = this._subscriptions || [];

            for (var i = 0; i < subs.length; ++i) {
                var sub = subs[i];
                if (sub.listenable === listenable) {
                    sub.stop();
                    (0, _invariant2.default)(subs.indexOf(sub) === -1, 'Failed to remove listen from subscriptions list!');
                    return true;
                }
            }
            return false;
        }

        /**
         * Adds a subscription
         */

    }, {
        key: 'addSubscription',
        value: function addSubscription(stop, listenable) {
            var subscriptionObj = { stop: stop, listenable: listenable };
            this._subscriptions.push(subscriptionObj);
            return subscriptionObj;
        }

        /**
         * Removes a subscription
         */

    }, {
        key: 'removeSubscription',
        value: function removeSubscription(subscription) {
            var index = this._subscriptions.indexOf(subscription);
            if (index < 0) return;

            this._subscriptions.splice(index, 1);
        }

        /**
         * Stops all subscriptions and empties subscriptions array
         */

    }, {
        key: 'stopListeningToAll',
        value: function stopListeningToAll() {
            var subs = this._subscriptions || [];
            var remaining = 0;

            while (remaining = subs.length) {
                subs[0].stop();
                (0, _invariant2.default)(subs.length === remaining - 1, 'Failed to remove listen from subscriptions list!');
            }
        }

        /**
         * Used in `listenTo`. Fetches initial data from a publisher if it has a `state` getter.
         * @param {Action|Store} listenable The publisher we want to get initial state from
         * @param {Function|String} defaultCallback The method to receive the data
         */

    }, {
        key: 'fetchInitialState',
        value: function fetchInitialState(listenable, defaultCallback) {
            var self = this;
            if (_.isFunction(defaultCallback) && listenable.state) {
                var data = listenable.state;
                if (data && _.isFunction(data.then)) {
                    data.then(function () {
                        defaultCallback.apply(self, arguments);
                    });
                } else {
                    defaultCallback.call(this, data);
                }
            }
        }

        /**
         * The callback will be called once all listenables have triggered at least once.
         * It will be invoked with the last emission from each listenable.
         * @param {Function} callback The method to call when all publishers have emitted
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
         */

    }, {
        key: 'joinTrailing',
        value: function joinTrailing(callback) {
            for (var _len = arguments.length, listenables = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                listenables[_key - 1] = arguments[_key];
            }

            return this._createJoin('last', callback, listenables);
        }

        /**
         * The callback will be called once all listenables have triggered at least once.
         * It will be invoked with the first emission from each listenable.
         * @param {...Publishers} publishers Publishers that should be tracked.
         * @param {Function|String} callback The method to call when all publishers have emitted
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
         */

    }, {
        key: 'joinLeading',
        value: function joinLeading(callback) {
            for (var _len2 = arguments.length, listenables = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                listenables[_key2 - 1] = arguments[_key2];
            }

            return this._createJoin('first', callback, listenables);
        }

        /**
         * The callback will be called once all listenables have triggered at least once.
         * It will be invoked with all emission from each listenable.
         * @param {...Publishers} publishers Publishers that should be tracked.
         * @param {Function|String} callback The method to call when all publishers have emitted
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
         */

    }, {
        key: 'joinConcat',
        value: function joinConcat(callback) {
            for (var _len3 = arguments.length, listenables = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                listenables[_key3 - 1] = arguments[_key3];
            }

            return this._createJoin('all', callback, listenables);
        }

        /**
         * The callback will be called once all listenables have triggered.
         * If a callback triggers twice before that happens, an error is thrown.
         * @param {...Publishers} publishers Publishers that should be tracked.
         * @param {Function|String} callback The method to call when all publishers have emitted
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
         */

    }, {
        key: 'joinStrict',
        value: function joinStrict(callback) {
            for (var _len4 = arguments.length, listenables = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                listenables[_key4 - 1] = arguments[_key4];
            }

            return this._createJoin('strict', callback, listenables);
        }
    }, {
        key: '_createJoin',
        value: function _createJoin(strategy, callback, listenables) {
            var _this3 = this;

            (0, _invariant2.default)(listenables.length >= 2, 'Cannot create a join with less than 2 listenables!');

            // validate everything
            listenables.forEach(function (listenable) {
                return _this3.validateListening(listenable);
            });

            var stop = new _Join2.default(listenables, strategy).listen(callback);

            var subobj = {
                listenable: listenables,
                stop: (function (_stop) {
                    function stop() {
                        return _stop.apply(this, arguments);
                    }

                    stop.toString = function () {
                        return _stop.toString();
                    };

                    return stop;
                })(function () {
                    stop();
                    _this3.removeSubscription(subobj);
                })
            };

            this._subscriptions.push(subobj);

            return subobj;
        }
    }]);

    return Listener;
})(_Publisher3.default);

exports.default = Listener;