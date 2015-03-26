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
    /*:: asyncResult    : boolean; */
    /*:: children       : Array< any >; */
    /*:: preEmit        : Function;*/
    /*:: shouldEmit     : Function ;*/

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
            get: function () /*:string*/{
                return "event";
            }
        },
        isAction: {
            get: function () /*:boolean*/{
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