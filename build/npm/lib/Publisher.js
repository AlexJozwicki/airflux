"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = require("./utils");

/**
 * @constructor
 */

var Publisher = (function () {
    /*:: emitter            : any;*/
    /*:: children           : Array< any >;*/
    /*:: _dispatchPromises  : Array< any >;*/

    /**
     * @protected
     */

    function Publisher() {
        _classCallCheck(this, Publisher);

        this.emitter = new _.EventEmitter();
        this.children = [];
        this._dispatchPromises = [];
    }

    _createClass(Publisher, {
        eventType: {
            get: function () /*:string*/{
                return "event";
            }
        },
        isPublisher: {
            get: function () /*:boolean*/{
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

            value: function shouldEmit() /*:boolean*/{
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

            value: function listen(callback, /*:Function*/bindContext) /*:?Function*/{
                var _this = this;

                var aborted = false;
                bindContext = bindContext || this;

                var eventHandler = function (args) {
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
                        //
                        //  TODO: check if we still need this with classes/do we allow override ?
                        var canHandlePromise /*:boolean*/ = Publisher.prototype.canHandlePromise.call(_this);
                        if (!canHandlePromise) {
                            console.warn("Unhandled promise for " + _this.eventType);
                            return;
                        }

                        _this._dispatchPromises.push({
                            promise: result,
                            listener: callback
                        });
                    }
                };
                this.emitter.addListener(this.eventType, eventHandler);

                return function () {
                    aborted = true;
                    _this.emitter.removeListener(_this.eventType, eventHandler);
                };
            }
        },
        listenOnce: {
            value: function listenOnce(callback, /*:Function*/bindContext) /*:Function*/{
                var _arguments = arguments;

                bindContext = bindContext || this;
                var unsubscribe = this.listen(function () {
                    var args = Array.prototype.slice.call(_arguments);
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

                var canHandlePromise /*:boolean*/ = this.children.indexOf("completed") >= 0 && this.children.indexOf("failed") >= 0;

                if (!canHandlePromise) {
                    throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
                }

                promise.then(function (response) {
                    return _this.completed.asFunction(response);
                })["catch"](function (error) {
                    return _this.failed.asFunction(error);
                });
            })
        },
        resolve: {

            /**
             * Attach handlers to promise that trigger the completed and failed
             * child publishers, if available.
             *
             * @param {Object} promise The result to use or a promise to which to listen.
             */
            // TODO: MOVE TO ACTION
            // as calling completed and failed is completely specific to an action, this should be moved to the Action class.

            value: function resolve(promise) {
                var _this = this;

                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                var canHandlePromise /*:boolean*/ = Publisher.prototype.canHandlePromise.call(this);
                if (!canHandlePromise) {
                    throw new Error("Not an async publisher");
                }

                if (!_.isPromise(promise)) {
                    this.completed.asFunction(promise);
                    return;
                }

                promise.then(function (response) {
                    return _this.completed.asFunction(response);
                }, function (error) {
                    return _this.failed.asFunction(error);
                });
            }
        },
        reject: {
            value: function reject(result) {
                if (_.isPromise(result)) {
                    console.warn("Use #resolve() for promises.");
                    return;
                }

                this.failed(result);
            }
        },
        then: {
            value: function then(onSuccess, onFailure) {
                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                var canHandlePromise /*:boolean*/ = Publisher.prototype.canHandlePromise.call(this);
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
            value: function canHandlePromise() /*:boolean*/{
                return this.completed && this.failed; // && this.completed._isActionFunctor && this.failed._isActionFunctor;
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
                    this._dispatchPromises = [];
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
                var _this = this;

                var args = arguments;
                _.nextTick(function () {
                    return _this.triggerSync.apply(_this, args);
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

                var promise = new Promise(function (resolve, reject) {
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

                    self.trigger.apply(this, args);
                });

                return promise;
            }
        },
        _handleDispatchPromises: {

            /**
             * @private
             */

            value: function _handleDispatchPromises() {
                var promises = this._dispatchPromises;
                this._dispatchPromises = [];

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

                var joinedPromise = Promise.all(mappedPromises);
                return this.resolve(joinedPromise);
            }
        }
    });

    return Publisher;
})();

// class Publisher

module.exports = Publisher;