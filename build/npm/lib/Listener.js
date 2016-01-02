'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('./utils');
var Publisher = require('./Publisher');
var instanceJoinCreator = require('./instanceJoinCreator');

/*:: type SubscriptionObj = { stop: Function; listenable: Action|Store }; */

/**
 * A module of methods related to listening.
 * @constructor
 * @extends {Publisher}
 */

var Listener = (function (_Publisher) {
    _inherits(Listener, _Publisher);

    /*:: subscriptions: Array< SubscriptionObj >;*/

    function Listener() {
        _classCallCheck(this, Listener);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Listener).call(this));

        _this.subscriptions = [];
        return _this;
    }

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */

    _createClass(Listener, [{
        key: 'hasListener',
        value: function hasListener(listenable /*:Action|Store*/) {
            var subs = this.subscriptions || [];
            for (var i = 0; i < subs.length; ++i) {
                var listenables = [].concat(subs[i].listenable);
                for (var j = 0; j < listenables.length; ++j) {
                    var listener = listenables[j];
                    if (listener === listenable) {
                        return true;
                    }
                    if (listener.hasListener && listener.hasListener(listenable)) {
                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * A convenience method that listens to all listenables in the given object.
         *
         * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
         */

    }, {
        key: 'listenToMany',
        value: function listenToMany(listenables /*:Action|Store*/) {
            var allListenables = flattenListenables(listenables);
            for (var key in allListenables) {
                var cbname = _.callbackName(key);
                var localname = this[cbname] ? cbname : this[key] ? key : undefined;
                if (localname) {
                    var callback = this[cbname + 'Default'] || this[localname + 'Default'] || localname;
                    this.listenTo(allListenables[key], localname, callback);
                }
            }
        }

        /**
         * Checks if the current context can listen to the supplied listenable
         *
         * @param {Action|Store} listenable An Action or Store that should be
         *  listened to.
         * @returns {String|Undefined} An error message, or undefined if there was no problem.
         */

    }, {
        key: 'validateListening',
        value: function validateListening(listenable /*:Action|Store*/) {
            if (listenable === this) {
                return 'Listener is not able to listen to itself';
            }
            if (!_.isFunction(listenable.listen)) {
                return listenable + ' is missing a listen method';
            }
            if (listenable.hasListener && listenable.hasListener(this)) {
                return 'Listener cannot listen to this listenable because of circular loop';
            }
        }

        /**
         * Sets up a subscription to the given listenable for the context object
         *
         * @param {Action|Store} listenable An Action or Store that should be
         *  listened to.
         * @param {Function|String} callback The callback to register as event handler
         * @param {Function|String} defaultCallback The callback to register as default handler
         * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
         */

    }, {
        key: 'listenTo',
        value: function listenTo(listenable /*:Action|Store*/, callback /*:Function|string*/, defaultCallback /*:Function:string*/) /*:SubscriptionObj*/{
            _.throwIf(this.validateListening(listenable));

            this.fetchInitialState(listenable, defaultCallback);

            var subs = this.subscriptions;
            var desub = listenable.listen(this[callback] || callback, this);
            var unsubscriber = function unsubscriber() {
                var index = subs.indexOf(subscriptionObj);
                _.throwIf(index === -1, 'Tried to remove listen already gone from subscriptions list!');
                subs.splice(index, 1);
                desub();
            };

            var subscriptionObj = {
                stop: unsubscriber,
                listenable: listenable
            };
            subs.push(subscriptionObj);
            return subscriptionObj;
        }

        /**
         * Stops listening to a single listenable
         *
         * @param {Action|Store} listenable The action or store we no longer want to listen to
         * @returns {Boolean} True if a subscription was found and removed, otherwise false.
         */

    }, {
        key: 'stopListeningTo',
        value: function stopListeningTo(listenable /*:Action|Store*/) /*:boolean*/{
            var subs = this.subscriptions || [];
            for (var i = 0; i < subs.length; ++i) {
                var sub = subs[i];
                if (sub.listenable === listenable) {
                    sub.stop();
                    _.throwIf(subs.indexOf(sub) !== -1, 'Failed to remove listen from subscriptions list!');
                    return true;
                }
            }
            return false;
        }

        /**
         * Stops all subscriptions and empties subscriptions array
         */

    }, {
        key: 'stopListeningToAll',
        value: function stopListeningToAll() {
            var subs = this.subscriptions || [];
            var remaining;
            while (remaining = subs.length) {
                subs[0].stop();
                _.throwIf(subs.length !== remaining - 1, 'Failed to remove listen from subscriptions list!');
            }
        }

        /**
         * Used in `listenTo`. Fetches initial data from a publisher if it has a `state` getter.
         * @param {Action|Store} listenable The publisher we want to get initial state from
         * @param {Function|String} defaultCallback The method to receive the data
         */

    }, {
        key: 'fetchInitialState',
        value: function fetchInitialState(listenable /*:Action|Store*/, defaultCallback /*:Function|string*/) {
            if (typeof defaultCallback === 'string') {
                defaultCallback = this[defaultCallback];
            }

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
    }]);

    return Listener;
})(Publisher);

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the last emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */

Listener.prototype.joinTrailing = instanceJoinCreator('last');

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the first emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinLeading = instanceJoinCreator('first');

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with all emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinConcat = instanceJoinCreator('all');

/**
 * The callback will be called once all listenables have triggered.
 * If a callback triggers twice before that happens, an error is thrown.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinStrict = instanceJoinCreator('strict');

/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function mapChildListenables(listenable /*:Action|Store*/) {
    var children = {};

    var childListenables = listenable.children || [];
    for (var i = 0; i < childListenables.length; ++i) {
        var childName = childListenables[i];
        if (listenable[childName]) {
            children[childName] = listenable[childName];
        }
    }

    return children;
};

/**
 * Make a flat dictionary of all listenables including their
 * possible children (recursively), concatenating names in camelCase.
 *
 * @param {Object} listenables The top-level listenables
 */
var flattenListenables = function flattenListenables(listenables /*:Action|Store*/) {
    var flattened = {};
    for (var key in listenables) {
        var listenable = listenables[key];
        var childMap = mapChildListenables(listenable);

        // recursively flatten children
        var children = flattenListenables(childMap);

        // add the primary listenable and chilren
        flattened[key] = listenable;
        for (var childKey in children) {
            var childListenable = children[childKey];
            flattened[key + _.capitalize(childKey)] = childListenable;
        }
    }

    return flattened;
};

module.exports = Listener;