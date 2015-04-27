"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Publisher = require("./Publisher");

/**
 *
 */

var Action = (function (_Publisher) {
    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

    function Action() {
        var sync /*:boolean*/ = arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, Action);

        _get(Object.getPrototypeOf(Action.prototype), "constructor", this).call(this);
        this.children = {};

        Object.defineProperty(this, "sync", { value: sync });
    }

    _inherits(Action, _Publisher);

    _createClass(Action, {
        asyncResult: {

            /**
             * Transforms the action into one returning an asynchronous result.
             * This will create two children actions:
             * - completed
             * - failed
             *
             * If the listen function returns a Promise, the Promise will be automatically mapped onto these two children actions.
             */

            value: function asyncResult() {
                var listenFunction = arguments[0] === undefined ? void 0 : arguments[0];

                this.children.completed = new Action();
                Object.defineProperty(this, "completed", { value: this.children.completed });

                this.children.failed = new Action();
                Object.defineProperty(this, "failed", { value: this.children.failed });

                if (typeof listenFunction === "function") {
                    this.listen(listenFunction);
                }

                return this;
            }
        },
        withChildren: {

            /**
             * Creates children actions
             */

            value: function withChildren(children) {
                var _this = this;

                children.forEach(function (child) {
                    if (typeof child === "string") {
                        var action = new Action();
                        _this.children[child] = action;
                        Object.defineProperty(_this, child, { value: action });
                    } else if (Array.isArray(child) && typeof child[0] === "string" && child[1] instanceof Action) {
                        var _name = child[0];
                        _this.children[_name] = child[1];
                        Object.defineProperty(_this, _name, { value: child[1] });
                    }
                });
                return this;
            }
        },
        asSyncFunction: {

            /**
             * Returns a synchronous function to trigger the action
             */

            get: function () {
                return this._createFunctor(true);
            }
        },
        asFunction: {

            /**
            * Returns a function to trigger the action, async or sync depending on the action definition.
             */

            get: function () {
                return this._createFunctor(this.sync);
            }
        },
        _createFunctor: {

            /**
             *
             */

            value: function _createFunctor() {
                var _this = this;

                var sync = arguments[0] === undefined ? false : arguments[0];

                var trigger = sync ? this.triggerSync : this.trigger;
                var functor = trigger.bind(this);

                Object.defineProperty(functor, "_isActionFunctor", { value: true });
                Object.defineProperty(functor, "action", { value: this });
                Object.defineProperty(functor, "listen", { value: function (fn, bindCtx) {
                        return Action.prototype.listen.call(_this, fn, bindCtx);
                    } });
                Object.defineProperty(functor, "listenOnce", { value: function (fn, bindCtx) {
                        return Action.prototype.listenOnce.call(_this, fn, bindCtx);
                    } });

                Object.keys(this.children).forEach(function (childName) {
                    Object.defineProperty(functor, childName, { value: _this.children[childName].asFunction });
                });

                return functor;
            }
        },
        eventType: {
            get: function () /*:string*/{
                return "event";
            }
        },
        isAction: {
            get: function () /*:boolean*/{
                return true;
            }
        }
    });

    return Action;
})(Publisher);

module.exports = Action;