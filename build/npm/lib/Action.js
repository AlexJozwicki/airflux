'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Publisher = require('./Publisher');

/**
 *
 */

var Action = (function (_Publisher) {
    _inherits(Action, _Publisher);

    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

    function Action() {
        var sync /*:boolean*/ = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, Action);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Action).call(this));

        _this.children = {};

        Object.defineProperty(_this, 'sync', { value: sync });
        return _this;
    }

    /**
     * Transforms the action into one returning an asynchronous result.
     * This will create two children actions:
     * - completed
     * - failed
     *
     * If the listen function returns a Promise, the Promise will be automatically mapped onto these two children actions.
     */

    _createClass(Action, [{
        key: 'asyncResult',
        value: function asyncResult() {
            var listenFunction = arguments.length <= 0 || arguments[0] === undefined ? void 0 : arguments[0];

            this.children.completed = new Action();
            Object.defineProperty(this, 'completed', { value: this.children.completed });

            this.children.failed = new Action();
            Object.defineProperty(this, 'failed', { value: this.children.failed });

            if (typeof listenFunction === 'function') {
                this.listen(listenFunction);
            }

            return this;
        }

        /**
         * Creates children actions
         */

    }, {
        key: 'withChildren',
        value: function withChildren(children) {
            var _this2 = this;

            children.forEach(function (child) {
                if (typeof child === 'string') {
                    var action = new Action();
                    _this2.children[child] = action;
                    Object.defineProperty(_this2, child, { value: action });
                } else if (Array.isArray(child) && typeof child[0] === 'string' && child[1] instanceof Action) {
                    var name = child[0];
                    _this2.children[name] = child[1];
                    Object.defineProperty(_this2, name, { value: child[1] });
                }
            });
            return this;
        }

        /**
         * Returns a synchronous function to trigger the action
         */

    }, {
        key: '_createFunctor',

        /**
         *
         */
        value: function _createFunctor() {
            var _this3 = this;

            var sync = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var trigger = sync ? this.triggerSync : this.trigger;
            var functor = trigger.bind(this);

            Object.defineProperty(functor, '_isActionFunctor', { value: true });
            Object.defineProperty(functor, 'action', { value: this });
            Object.defineProperty(functor, 'listen', { value: function value(fn, bindCtx) {
                    return Action.prototype.listen.call(_this3, fn, bindCtx);
                } });
            Object.defineProperty(functor, 'listenOnce', { value: function value(fn, bindCtx) {
                    return Action.prototype.listenOnce.call(_this3, fn, bindCtx);
                } });

            Object.keys(this.children).forEach(function (childName) {
                Object.defineProperty(functor, childName, { value: _this3.children[childName].asFunction });
            });

            return functor;
        }
    }, {
        key: 'asSyncFunction',
        get: function get() {
            return this._createFunctor(true);
        }

        /**
        * Returns a function to trigger the action, async or sync depending on the action definition.
         */

    }, {
        key: 'asFunction',
        get: function get() {
            return this._createFunctor(this.sync);
        }
    }, {
        key: 'eventType',
        get: function get() /*:string*/{
            return 'event';
        }
    }, {
        key: 'isAction',
        get: function get() /*:boolean*/{
            return true;
        }
    }]);

    return Action;
})(Publisher);

module.exports = Action;