'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Publisher2 = require('./Publisher');

var _Publisher3 = _interopRequireDefault(_Publisher2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 */

var Action = (function (_Publisher) {
    _inherits(Action, _Publisher);

    function Action() {
        var sync = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, Action);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Action).call(this));

        _this.children = {};
        _this._sync = sync;
        return _this;
    }

    /**
     * Creates children actions
     */

    /** Whether or not the triggering of the action is synchronous or at the next tick. */

    _createClass(Action, [{
        key: 'withChildren',
        value: function withChildren(children) {
            var _this2 = this;

            children.forEach(function (child) {
                if (typeof child === 'string') {
                    var _action = new Action();
                    _this2.children[child] = _action;
                    Object.defineProperty(_this2, child, { value: _action });
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
        key: 'createFunctor',

        /**
         *
         */
        value: function createFunctor(triggerFn) {
            var _this3 = this;

            var functor = triggerFn.bind(this);

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
            return this.createFunctor(this.triggerSync);
        }

        /**
        * Returns a function to trigger the action, async or sync depending on the action definition.
         */

    }, {
        key: 'asFunction',
        get: function get() {
            return this.createFunctor(this._sync ? this.triggerSync : this.trigger);
        }
    }, {
        key: 'exec',
        get: function get() {
            return this.asFunction;
        }
    }, {
        key: 'eventLabel',
        get: function get() {
            return 'event';
        }
    }, {
        key: 'isAction',
        get: function get() {
            return true;
        }
    }]);

    return Action;
})(_Publisher3.default);

exports.default = Action;