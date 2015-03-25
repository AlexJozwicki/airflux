!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.airflux=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],2:[function(_dereq_,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Publisher = _dereq_("./Publisher");

/**
 *
 */

var Action = (function (_Publisher) {
    function Action() {
        var definition = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Action);

        _get(Object.getPrototypeOf(Action.prototype), "constructor", this).call(this);

        this.asyncResult = !!definition.asyncResult;

        this.children = definition.children || [];
        if (this.asyncResult) {
            this.children.push("completed", "failed");
        }

        if (definition.preEmit) {
            this.preEmit = definition.preEmit;
        }
        if (definition.shouldEmit) {
            this.shouldEmit = definition.shouldEmit;
        }

        this.createChildActions();

        var trigger = definition.sync ? this.triggerSync : this.trigger;
        var functor = trigger.bind(this);
        functor.__proto__ = this;

        return functor;
    }

    _inherits(Action, _Publisher);

    _createClass(Action, {
        eventType: {
            get: function () {
                return "event";
            }
        },
        isAction: {
            get: function () {
                return true;
            }
        },
        createChildActions: {

            /**
             * @protected
             */

            value: function createChildActions() {
                var _this = this;

                this.children.forEach(function (childName) {
                    return _this[childName] = new Action({ actionType: childName });
                });
            }
        }
    });

    return Action;
})(Publisher);

module.exports = Action;

},{"./Publisher":5}],3:[function(_dereq_,module,exports){
"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Store = _dereq_("./Store");

var JoinStrictStore = (function (_Store) {
    function JoinStrictStore() {
        _classCallCheck(this, JoinStrictStore);

        _get(Object.getPrototypeOf(JoinStrictStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinStrict.apply(this, listenables);
    }

    _inherits(JoinStrictStore, _Store);

    return JoinStrictStore;
})(Store);

var JoinLeadingStore = (function (_Store2) {
    function JoinLeadingStore() {
        _classCallCheck(this, JoinLeadingStore);

        _get(Object.getPrototypeOf(JoinLeadingStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinLeading.apply(this, listenables);
    }

    _inherits(JoinLeadingStore, _Store2);

    return JoinLeadingStore;
})(Store);

var JoinTrailingStore = (function (_Store3) {
    function JoinTrailingStore() {
        _classCallCheck(this, JoinTrailingStore);

        _get(Object.getPrototypeOf(JoinTrailingStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinTrailing.apply(this, listenables);
    }

    _inherits(JoinTrailingStore, _Store3);

    return JoinTrailingStore;
})(Store);

var JoinConcatStore = (function (_Store4) {
    function JoinConcatStore() {
        _classCallCheck(this, JoinConcatStore);

        _get(Object.getPrototypeOf(JoinConcatStore.prototype), "constructor", this).call(this);

        var listenables = [].concat(_slice.call(arguments), ["trigger"]);
        this.joinConcat.apply(this, listenables);
    }

    _inherits(JoinConcatStore, _Store4);

    return JoinConcatStore;
})(Store);

module.exports = {
    JoinStrict: function JoinStrict() {
        return _applyConstructor(JoinStrictStore, _slice.call(arguments));
    },
    JoinLeading: function JoinLeading() {
        return _applyConstructor(JoinLeadingStore, _slice.call(arguments));
    },
    JoinTrailing: function JoinTrailing() {
        return _applyConstructor(JoinTrailingStore, _slice.call(arguments));
    },
    JoinConcat: function JoinConcat() {
        return _applyConstructor(JoinConcatStore, _slice.call(arguments));
    }
};

},{"./Store":6}],4:[function(_dereq_,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _dereq_("./utils");

var Publisher = _dereq_("./Publisher");

var instanceJoinCreator = _dereq_("./instanceJoinCreator");

/**
 * A module of methods related to listening.
 * @constructor
 * @extends {Publisher}
 */

var Listener = (function (_Publisher) {
    function Listener() {
        _classCallCheck(this, Listener);

        _get(Object.getPrototypeOf(Listener.prototype), "constructor", this).call(this);
        this.subscriptions = [];
    }

    _inherits(Listener, _Publisher);

    _createClass(Listener, {
        hasListener: {

            /**
             * An internal utility function used by `validateListening`
             *
             * @param {Action|Store} listenable The listenable we want to search for
             * @returns {Boolean} The result of a recursive search among `this.subscriptions`
             */

            value: function hasListener(listenable) {
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
        },
        listenToMany: {

            /**
             * A convenience method that listens to all listenables in the given object.
             *
             * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
             */

            value: function listenToMany(listenables) {
                var allListenables = flattenListenables(listenables);
                for (var key in allListenables) {
                    var cbname = _.callbackName(key);
                    var localname = this[cbname] ? cbname : this[key] ? key : undefined;
                    if (localname) {
                        var callback = this[cbname + "Default"] || this[localname + "Default"] || localname;
                        this.listenTo(allListenables[key], localname, callback);
                    }
                }
            }
        },
        validateListening: {

            /**
             * Checks if the current context can listen to the supplied listenable
             *
             * @param {Action|Store} listenable An Action or Store that should be
             *  listened to.
             * @returns {String|Undefined} An error message, or undefined if there was no problem.
             */

            value: function validateListening(listenable) {
                if (listenable === this) {
                    return "Listener is not able to listen to itself";
                }
                if (!_.isFunction(listenable.listen)) {
                    return listenable + " is missing a listen method";
                }
                if (listenable.hasListener && listenable.hasListener(this)) {
                    return "Listener cannot listen to this listenable because of circular loop";
                }
            }
        },
        listenTo: {

            /**
             * Sets up a subscription to the given listenable for the context object
             *
             * @param {Action|Store} listenable An Action or Store that should be
             *  listened to.
             * @param {Function|String} callback The callback to register as event handler
             * @param {Function|String} defaultCallback The callback to register as default handler
             * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
             */

            value: function listenTo(listenable, callback, defaultCallback) {
                _.throwIf(this.validateListening(listenable));

                this.fetchInitialState(listenable, defaultCallback);

                var subs = this.subscriptions;
                var desub = listenable.listen(this[callback] || callback, this);
                var unsubscriber = function unsubscriber() {
                    var index = subs.indexOf(subscriptionObj);
                    _.throwIf(index === -1, "Tried to remove listen already gone from subscriptions list!");
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
        },
        stopListeningTo: {

            /**
             * Stops listening to a single listenable
             *
             * @param {Action|Store} listenable The action or store we no longer want to listen to
             * @returns {Boolean} True if a subscription was found and removed, otherwise false.
             */

            value: function stopListeningTo(listenable) {
                var subs = this.subscriptions || [];
                for (var i = 0; i < subs.length; ++i) {
                    var sub = subs[i];
                    if (sub.listenable === listenable) {
                        sub.stop();
                        _.throwIf(subs.indexOf(sub) !== -1, "Failed to remove listen from subscriptions list!");
                        return true;
                    }
                }
                return false;
            }
        },
        stopListeningToAll: {

            /**
             * Stops all subscriptions and empties subscriptions array
             */

            value: function stopListeningToAll() {
                var subs = this.subscriptions || [];
                var remaining;
                while (remaining = subs.length) {
                    subs[0].stop();
                    _.throwIf(subs.length !== remaining - 1, "Failed to remove listen from subscriptions list!");
                }
            }
        },
        fetchInitialState: {

            /**
             * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.
             * @param {Action|Store} listenable The publisher we want to get initial state from
             * @param {Function|String} defaultCallback The method to receive the data
             */

            value: function fetchInitialState(listenable, defaultCallback) {
                if (typeof defaultCallback === "string") {
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
        }
    });

    return Listener;
})(Publisher);

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the last emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinTrailing = instanceJoinCreator("last");

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with the first emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinLeading = instanceJoinCreator("first");

/**
 * The callback will be called once all listenables have triggered at least once.
 * It will be invoked with all emission from each listenable.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinConcat = instanceJoinCreator("all");

/**
 * The callback will be called once all listenables have triggered.
 * If a callback triggers twice before that happens, an error is thrown.
 * @param {...Publishers} publishers Publishers that should be tracked.
 * @param {Function|String} callback The method to call when all publishers have emitted
 * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
 */
Listener.prototype.joinStrict = instanceJoinCreator("strict");

/**
 * Extract child listenables from a parent from their
 * children property and return them in a keyed Object
 *
 * @param {Object} listenable The parent listenable
 */
var mapChildListenables = function mapChildListenables(listenable) {
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
var flattenListenables = (function (_flattenListenables) {
    var _flattenListenablesWrapper = function flattenListenables(_x) {
        return _flattenListenables.apply(this, arguments);
    };

    _flattenListenablesWrapper.toString = function () {
        return _flattenListenables.toString();
    };

    return _flattenListenablesWrapper;
})(function (listenables) {
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
});

module.exports = Listener;

},{"./Publisher":5,"./instanceJoinCreator":8,"./utils":9}],5:[function(_dereq_,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _dereq_("./utils");

/**
 * @constructor
 */

var Publisher = (function () {
    /**
     * @protected
     */

    function Publisher() {
        _classCallCheck(this, Publisher);

        this.emitter = new _.EventEmitter();
        this.children = [];
        this.dispatchPromises_ = [];
    }

    _createClass(Publisher, {
        eventType: {
            get: function () {
                return "event";
            }
        },
        isPublisher: {
            get: function () {
                return true;
            }
        },
        preEmit: {

            /**
             * Hook used by the publisher that is invoked before emitting
             * and before `shouldEmit`. The arguments are the ones that the action
             * is invoked with. If this function returns something other than
             * undefined, that will be passed on as arguments for shouldEmit and
             * emission.
             */

            value: function preEmit() {}
        },
        shouldEmit: {

            /**
             * Hook used by the publisher after `preEmit` to determine if the
             * event should be emitted with given arguments. This may be overridden
             * in your application, default implementation always returns true.
             *
             * @returns {Boolean} true if event should be emitted
             */

            value: function shouldEmit() {
                return true;
            }
        },
        listen: {

            /**
             * Subscribes the given callback for action triggered
             *
             * @param {Function} callback The callback to register as event handler
             * @param {Mixed} [optional] bindContext The context to bind the callback with
             * @returns {Function} Callback that unsubscribes the registered event handler
             */

            value: function listen(callback, bindContext) {
                var self = this;
                var aborted = false;
                bindContext = bindContext || this;

                var eventHandler = function eventHandler(args) {
                    if (aborted) {
                        // This state is achieved when one listener removes another.
                        //   It might be considered a bug of EventEmitter2 which makes
                        //   a snapshot of the listener list before looping through them
                        //   and effectively ignores calls to removeListener() during emit.
                        // TODO: Needs a test.
                        return;
                    }

                    var result = callback.apply(bindContext, args);
                    if (_.isPromise(result)) {
                        // Note: To support mixins, we need to access the method this way.
                        //   Overrides are not possible.
                        var canHandlePromise = Publisher.prototype.canHandlePromise.call(self);
                        if (!canHandlePromise) {
                            console.warn("Unhandled promise for " + self.eventType);
                            return;
                        }

                        self.dispatchPromises_.push({
                            promise: result,
                            listener: callback
                        });
                    }
                };
                this.emitter.addListener(this.eventType, eventHandler);

                return function () {
                    aborted = true;
                    self.emitter.removeListener(self.eventType, eventHandler);
                };
            }
        },
        listenOnce: {
            value: function listenOnce(callback, bindContext) {
                bindContext = bindContext || this;
                var unsubscribe = this.listen(function () {
                    var args = Array.prototype.slice.call(arguments);
                    unsubscribe();
                    return callback.apply(bindContext, args);
                });
                return unsubscribe;
            }
        },
        promise: {

            /**
             * Attach handlers to promise that trigger the completed and failed
             * child publishers, if available.
             *
             * @param {Object} The promise to attach to
             */

            value: (function (_promise) {
                var _promiseWrapper = function promise(_x) {
                    return _promise.apply(this, arguments);
                };

                _promiseWrapper.toString = function () {
                    return _promise.toString();
                };

                return _promiseWrapper;
            })(function (promise) {
                var _this = this;

                var canHandlePromise = this.children.indexOf("completed") >= 0 && this.children.indexOf("failed") >= 0;

                if (!canHandlePromise) {
                    throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
                }

                promise.then(function (response) {
                    return _this.completed(response);
                })["catch"](function (error) {
                    return _this.failed(error);
                });
            })
        },
        fetchJson: {

            /**
             */

            value: function fetchJson(promise) {
                var _this = this;

                var canHandlePromise = this.children.indexOf("completed") >= 0 && this.children.indexOf("failed") >= 0;

                if (!canHandlePromise) {
                    throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
                }

                promise.then(function (response) {
                    return response.json();
                }).then(this.completed)["catch"](function (error) {
                    return _this.failed(error);
                });
            }
        },
        listenAndPromise: {

            /**
             * Subscribes the given callback for action triggered, which should
             * return a promise that in turn is passed to `this.promise`
             *
             * @param {Function} callback The callback to register as event handler
             */

            value: function listenAndPromise(callback, bindContext, resolver) {
                var me = this;
                bindContext = bindContext || this;
                this.willCallPromise = (this.willCallPromise || 0) + 1;

                var removeListen = this.listen(function () {
                    if (!callback) {
                        throw new Error("Expected a function returning a promise but got " + callback);
                    }

                    var args = arguments,
                        promise = callback.apply(bindContext, args);
                    return me.promise.call(me, promise);
                }, bindContext);

                return function () {
                    me.willCallPromise--;
                    removeListen.call(me);
                };
            }
        },
        listenAndFetchJson: {

            /**
             * EXPERIMENT
             */

            value: function listenAndFetchJson(callback, bindContext) {
                var me = this;
                bindContext = bindContext || this;
                this.willCallPromise = (this.willCallPromise || 0) + 1;

                var removeListen = this.listen(function () {
                    if (!callback) {
                        throw new Error("Expected a function returning a promise but got " + callback);
                    }

                    var args = arguments,
                        promise = callback.apply(bindContext, args);
                    return me.fetchJson.call(me, promise);
                }, bindContext);

                return function () {
                    me.willCallPromise--;
                    removeListen.call(me);
                };
            }
        },
        resolve: {

            /**
             * Attach handlers to promise that trigger the completed and failed
             * child publishers, if available.
             *
             * @param {Object} promise The result to use or a promise to which to listen.
             */

            value: function resolve(promise) {
                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
                if (!canHandlePromise) {
                    throw new Error("Not an async publisher");
                }

                if (!_.isPromise(promise)) {
                    this.completed.trigger(promise);
                    return;
                }

                var self = this;
                promise.then(function (response) {
                    return self.completed.trigger(response);
                }, function (error) {
                    return self.failed.trigger(error);
                });
            }
        },
        reject: {
            value: function reject(result) {
                if (_.isPromise(result)) {
                    console.warn("Use #resolve() for promises.");
                    return;
                }

                this.failed.trigger(result);
            }
        },
        then: {
            value: function then(onSuccess, onFailure) {
                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
                if (!canHandlePromise) {
                    throw new Error("Not an async publisher");
                }

                if (onSuccess) {
                    this.completed.listenOnce(onSuccess);
                }
                if (onFailure) {
                    this.failed.listenOnce(onFailure);
                }
            }
        },
        "catch": {
            value: function _catch(onFailure) {
                this.then(null, onFailure);
            }
        },
        canHandlePromise: {
            value: function canHandlePromise() {
                return this.completed && this.failed && this.completed.isPublisher && this.failed.isPublisher;
            }
        },
        triggerSync: {

            /**
             * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
             */

            value: function triggerSync() {
                var args = arguments;
                var preResult = this.preEmit.apply(this, args);
                if (typeof preResult !== "undefined") {
                    args = _.isArguments(preResult) ? preResult : [].concat(preResult);
                }

                if (this.shouldEmit.apply(this, args)) {
                    this.dispatchPromises_ = [];
                    this.emitter.emit(this.eventType, args);
                    // Note: To support mixins, we need to access the method this way.
                    //   Overrides are not possible.
                    Publisher.prototype._handleDispatchPromises.call(this);
                }
            }
        },
        trigger: {

            /**
             * Tries to publish the event on the next tick
             */

            value: function trigger() {
                var args = arguments;
                var self = this;

                _.nextTick(function () {
                    self.triggerSync.apply(self, args);
                });
            }
        },
        triggerPromise: {

            /**
             * Returns a Promise for the triggered action
             */

            value: function triggerPromise() {
                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
                if (!canHandlePromise) {
                    throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
                }

                var self = this;
                var args = arguments;

                var promise = _.createPromise(function (resolve, reject) {
                    var removeSuccess = self.completed.listen(function (args) {
                        removeSuccess();
                        removeFailed();
                        resolve(args);
                    });

                    var removeFailed = self.failed.listen(function (args) {
                        removeSuccess();
                        removeFailed();
                        reject(args);
                    });

                    self.trigger.apply(self, args);
                });

                return promise;
            }
        },
        _handleDispatchPromises: {
            value: function _handleDispatchPromises() {
                var promises = this.dispatchPromises_;
                this.dispatchPromises_ = [];

                if (promises.length === 0) {
                    return;
                }
                if (promises.length === 1) {
                    return this.resolve(promises[0].promise);
                }

                var mappedPromises = promises.map(function (item) {
                    return item.promise.then(function (result) {
                        return {
                            listener: item.listener,
                            value: result
                        };
                    });
                });

                var joinedPromise = _.Promise.all(mappedPromises);
                return this.resolve(joinedPromise);
            }
        }
    });

    return Publisher;
})();

// class Publisher

module.exports = Publisher;

},{"./utils":9}],6:[function(_dereq_,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Listener = _dereq_("./Listener");

/**
 */

var Store = (function (_Listener) {
    function Store() {
        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), "constructor", this).call(this);
    }

    _inherits(Store, _Listener);

    _createClass(Store, {
        eventType: {
            get: function () {
                return "change";
            }
        },
        publishState: {

            /**
             * Publishes the state to all subscribers.
             * This ensures that the stores always publishes the same data/signature.
             */

            value: function publishState() {
                _get(Object.getPrototypeOf(Store.prototype), "trigger", this).call(this, this.state);
            }
        }
    });

    return Store;
})(Listener);

module.exports = Store;

},{"./Listener":4}],7:[function(_dereq_,module,exports){
"use strict";

var _ = _dereq_("./utils");
var JoinStores = _dereq_("./JoinStores");

exports.Action = _dereq_("./Action");
exports.Listener = _dereq_("./Listener");
exports.Publisher = _dereq_("./Publisher");
exports.Store = _dereq_("./Store");

exports.joinTrailing = exports.all = JoinStores.JoinTrailing;
exports.joinLeading = JoinStores.JoinLeading;
exports.joinStrict = JoinStores.JoinStrict;
exports.joinConcat = JoinStores.JoinConcat;

exports.EventEmitter = _.EventEmitter;
exports.Promise = _.Promise;

/**
 * Sets the eventmitter that Airflux uses
 */
exports.setEventEmitter = function (ctx) {
  var _ = _dereq_("./utils");
  exports.EventEmitter = _.EventEmitter = ctx;
};

/**
 * Sets the Promise library that Airflux uses
 */
exports.setPromise = function (ctx) {
  var _ = _dereq_("./utils");
  exports.Promise = _.Promise = ctx;
};

/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
exports.setPromiseFactory = function (factory) {
  var _ = _dereq_("./utils");
  _.createPromise = factory;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function (nextTick) {
  var _ = _dereq_("./utils");
  _.nextTick = nextTick;
};

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
  console.error("Function.prototype.bind not available. " + "ES5 shim required. " + "https://github.com/jankuca/airflux#es5");
}

},{"./Action":2,"./JoinStores":3,"./Listener":4,"./Publisher":5,"./Store":6,"./utils":9}],8:[function(_dereq_,module,exports){
"use strict";

var _ = _dereq_("./utils");

var slice = Array.prototype.slice;

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
module.exports = function instanceJoinCreator(strategy) {
    return function () {
        _.throwIf(arguments.length < 3, "Cannot create a join with less than 2 listenables!");

        var listenables = slice.call(arguments);
        var callback = listenables.pop();
        var numberOfListenables = listenables.length;
        var join = {
            numberOfListenables: numberOfListenables,
            callback: this[callback] || callback,
            listener: this,
            strategy: strategy
        };
        var cancels = [];

        var i;
        for (i = 0; i < numberOfListenables; ++i) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; ++i) {
            cancels.push(listenables[i].listen(newListener(i, join), this));
        }
        reset(join);

        var subobj = { listenable: listenables };
        subobj.stop = makeStopper(subobj, cancels, this);

        this.subscriptions = (this.subscriptions || []).concat(subobj);

        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj, cancels, context) {
    return function () {
        var i,
            subs = context.subscriptions,
            index = subs ? subs.indexOf(subobj) : -1;
        _.throwIf(index === -1, "Tried to remove join already gone from subscriptions list!");
        for (i = 0; i < cancels.length; ++i) {
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i, join) {
    return function () {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]) {
            switch (join.strategy) {
                case "strict":
                    throw new Error("Strict join failed because listener triggered twice.");
                case "last":
                    join.args[i] = callargs;break;
                case "all":
                    join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = join.strategy === "all" ? [callargs] : callargs;
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; ++i) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener, join.args);
    reset(join);
}
/* listenables..., callback*/

},{"./utils":9}],9:[function(_dereq_,module,exports){
/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
"use strict";

var isObject = exports.isObject = function (obj) {
    var type = typeof obj;
    return type === "function" || type === "object" && !!obj;
};

exports.isFunction = function (value) {
    return typeof value === "function";
};

exports.isPromise = function (value) {
    return value && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
};

exports.EventEmitter = _dereq_("eventemitter3");

exports.nextTick = function (callback) {
    setTimeout(callback, 0);
};

exports.capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.callbackName = function (string) {
    return "on" + exports.capitalize(string);
};

exports.object = function (keys, vals) {
    var o = {},
        i = 0;
    for (; i < keys.length; i++) {
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.Promise = Promise;

exports.createPromise = function (resolver) {
    return new exports.Promise(resolver);
};

exports.isArguments = function (value) {
    return typeof value === "object" && "callee" in value && typeof value.length === "number";
};

exports.throwIf = function (val, msg) {
    if (val) {
        throw Error(msg || val);
    }
};

},{"eventemitter3":1}]},{},[7])
(7)
});