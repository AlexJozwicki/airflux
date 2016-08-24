'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = FluxComponent;

var _Listener = require('./Listener');

var _Listener2 = _interopRequireDefault(_Listener);

var _Publisher = require('./Publisher');

var _Publisher2 = _interopRequireDefault(_Publisher);

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * React Component decorator
 */
function FluxComponent(target) {
    var clazz = target.prototype;

    /**
     * Wrap the componentDidMount with our own.
     * We will start listening to every action once the component is mounted.
     */
    var orgComponentDidMount = clazz.componentDidMount;
    clazz.componentDidMount = function () {
        var _this = this;

        if (!!orgComponentDidMount) orgComponentDidMount.call(this);

        this.__listener = this.__listener || new _Listener2.default();
        this.__publishers.forEach(function (pub) {
            return _this.__listenToPublisher(pub.publisher, pub.callback);
        });
        this.__stores.forEach(function (st) {
            return _this.__listenToStore(st.store, st.stateKey);
        });
    };

    /**
     * Wrap the componentWillMount with our own.
     * For store connections, we set the value of the state before the first render.
     * After that, it will be done through setState
     */
    var orgComponentWillMount = clazz.componentWillMount;
    clazz.componentWillMount = function () {
        var _this2 = this;

        this.state = this.state || {};
        this.__publishers = this.__publishers || [];
        this.__stores = this.__stores || [];

        this.__stores.forEach(function (st) {
            return _this2.state[st.stateKey] = st.store.state;
        });
        if (!!orgComponentWillMount) orgComponentWillMount.call(this);
    };

    /**
     * Wrap the componentWillMount with our own.
     * Stops listening to every subscriptions.
     */
    var orgComponentWillUnmount = clazz.componentWillUnmount;
    clazz.componentWillUnmount = function () {
        if (!!this.__listener) this.__listener.stopListeningToAll();
        if (!!orgComponentWillUnmount) orgComponentWillUnmount.call(this);
    };

    /**
     * Starts listening to a store.
     * The state of the store will be connected to the state of the componentWillUnmount
     * @param  {Store} store
     * @param  {string} stateKey
     */
    clazz.__listenToStore = function (store, stateKey) {
        var _this3 = this;

        this.__listener.listenTo(store, function (value) {
            return _this3.setState(_defineProperty({}, stateKey, value));
        });
    };

    clazz.__listenToPublisher = function (publisher, callback) {
        var $this = this;

        this.__listener.listenTo(publisher, function () {
            callback.apply($this, arguments);
        });
    };

    /**
     * Connects the component to a store.
     *
     * @param  {Store} store        the store to listen to
     * @param  {string} stateKey    the key in the state of the component where the state of the store will be put
     */
    clazz.connectStore = function (store, stateKey) {
        this.__stores = this.__stores || [];
        this.__stores.push({ store: store, stateKey: stateKey });
    };

    /**
     * Listens to an action or store, and calls a callback everytime.
     * @param  {Publiser} publisher
     * @param  {Function} callback
     */
    clazz.listenTo = function (publisher, callback) {
        this.__publishers = this.__publishers || [];
        this.__publishers.push({ publisher: publisher, callback: callback });
    };
}