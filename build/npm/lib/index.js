"use strict";

var _ = require("./utils");
var JoinStores = require("./JoinStores");

exports.Action = require("./Action");
exports.Listener = require("./Listener");
exports.Publisher = require("./Publisher");
exports.Store = require("./Store");
exports.FluxComponent = require("./FluxComponent");

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
  var _ = require("./utils");
  exports.EventEmitter = _.EventEmitter = ctx;
};

/**
 * Sets the Promise library that Airflux uses
 */
exports.setPromise = function (ctx) {
  var _ = require("./utils");
  exports.Promise = _.Promise = ctx;
};

/**
 * Sets the Promise factory that creates new promises
 * @param {Function} factory has the signature `function(resolver) { return [new Promise]; }`
 */
exports.setPromiseFactory = function (factory) {
  var _ = require("./utils");
  _.createPromise = factory;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function (nextTick) {
  var _ = require("./utils");
  _.nextTick = nextTick;
};

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
  console.error("Function.prototype.bind not available. " + "ES5 shim required. " + "https://github.com/jankuca/airflux#es5");
}