'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.FluxComponent = undefined;

var _FluxComponent = require('./FluxComponent');

Object.defineProperty(exports, 'FluxComponent', {
    enumerable: true,
    get: function get() {
        return _FluxComponent.default;
    }
});

var _AsyncResultAction = require('./AsyncResultAction');

var _AsyncResultAction2 = _interopRequireDefault(_AsyncResultAction);

var _Store2 = require('./Store');

var _Store3 = _interopRequireDefault(_Store2);

var _FluxComponent2 = _interopRequireDefault(_FluxComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A nice way to avoid starting a Promise inside a React component, and writing a this.setState in the then..
 * which crashes if for any reason the component is unmounted.
 * Which happens often with Views, when the users goes somewhere else.
 *
 * @example
 *   this.connectStore( new PhantomStore( () => fetch( '/url' ), arg1, arg2 ), 'stateKey' );
 *
 */

var PhantomStore = (function (_Store) {
    _inherits(PhantomStore, _Store);

    /**
     *
     * @param  {Function}   promiseFunctor      the function returning a Promise, to wrap
     * @param  {...}        args                arguments to be passed to the function, when called.
     */

    function PhantomStore(promiseFunctor) {
        _classCallCheck(this, PhantomStore);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PhantomStore).call(this));

        var action = new _AsyncResultAction2.default(promiseFunctor).asFunction;
        _this.listenTo(action.completed, function (res) {
            _this.state = res;
            _this.publishState();
        });

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        action.apply(undefined, args);
        return _this;
    }

    return PhantomStore;
})(_Store3.default);

exports.default = PhantomStore;