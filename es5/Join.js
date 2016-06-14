'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Publisher = require('./Publisher');

var _Publisher2 = _interopRequireDefault(_Publisher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var slice = Array.prototype.slice;

var Join = (function () {
    function Join(listenables, strategy) {
        _classCallCheck(this, Join);

        this._args = [];
        this._listenablesEmitted = [];

        this._listenables = listenables;
        this._strategy = strategy;
        this._reset();
    }

    _createClass(Join, [{
        key: '_reset',
        value: function _reset() {
            this._listenablesEmitted = new Array(this.count);
            this._args = new Array(this.count);
        }
    }, {
        key: 'listen',
        value: function listen(callback) {
            var _this = this;

            var cancels = this._listenables.map(function (listenable, i) {
                return listenable.listen(_this._newListener(i).bind(_this));
            });
            this._callback = callback;

            return function () {
                return cancels.forEach(function (cancel) {
                    return cancel();
                });
            };
        }
    }, {
        key: '_newListener',
        value: function _newListener(i) {
            return function () {
                var callargs = slice.call(arguments);
                if (this._listenablesEmitted[i]) {
                    switch (this._strategy) {
                        case "strict":
                            throw new Error("Strict join failed because listener triggered twice.");
                        case "last":
                            this._args[i] = callargs;break;
                        case "all":
                            this._args[i].push(callargs);
                    }
                } else {
                    this._listenablesEmitted[i] = true;
                    this._args[i] = this._strategy === "all" ? [callargs] : callargs;
                }

                this._emitIfAllListenablesEmitted();
            };
        }
    }, {
        key: '_emitIfAllListenablesEmitted',
        value: function _emitIfAllListenablesEmitted() {
            for (var i = 0; i < this.count; ++i) {
                if (!this._listenablesEmitted[i]) {
                    return;
                }
            }

            this._callback.apply(null, this._args);
            this._reset();
        }
    }, {
        key: 'count',
        get: function get() {
            return this._listenables.length;
        }
    }]);

    return Join;
})();

exports.default = Join;