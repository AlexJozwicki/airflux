var chai = require('chai'),
    assert = chai.assert,
    airflux = require('../src'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating stores', function() {

    describe('with one store listening to a simple action', function() {
        var action,
            store,
            promise,
            unsubCallback;

        beforeEach(function() {
            airflux.StoreMethods = {};

            promise = new Promise(function(resolve) {
                action = new airflux.SimpleAction();
                class AnonStore extends airflux.Store {
                    constructor() {
                        super();
                        unsubCallback = this.listenTo(action, this.actionCalled);
                    }

                    actionCalled() {
                        var args = Array.prototype.slice.call(arguments, 0);
                        this.trigger(args);
                        resolve(args);
                    }
                }

                store = new AnonStore();
            });
        });

        it('should get argument given on action', function() {
            action('my argument');

            return assert.eventually.equal(promise, 'my argument');
        });

        it('should get any arbitrary arguments given on action', function() {
            action(1337, 'ninja');

            return assert.eventually.deepEqual(promise, [1337, 'ninja']);
        });

        it('should throw an error when it listens on itself', function() {
            assert.throws(function() {
                store.listenTo(store, function() {});
            }, Error);
        });

        describe('and with listener unsubscribed', function() {

            beforeEach(function() {
                unsubCallback.stop();
            });

            it('shouldn\'t have been called when action is called', function(done) {
                var resolved = false;
                promise.then(function() {
                    resolved = true;
                });

                action(1337, 'ninja');

                setTimeout(function() {
                  assert.isFalse(resolved);
                  done();
                }, 20);
            });

            it('can listenTo the same action again', function() {
                store.listenTo(action, store.actionCalled);
                action(1337, 'ninja');

                return assert.eventually.deepEqual(promise, [1337, 'ninja']);
            });

        });

        it('should be able to reuse action again further down the chain', function() {
            new class extends airflux.Store {
                constructor() {
                    super();

                    this.listenTo(store, this.trigger);
                    this.listenTo(action, this.trigger);
                }
            }();

            action(1337);

            return assert.eventually.deepEqual(promise, [1337]);
        });

        describe('listening to the store', function() {
            var unsubStoreCallback, storeListenPromise;

            beforeEach(function() {
                storeListenPromise = new Promise(function(resolve) {
                    unsubStoreCallback = store.listen(function() {
                        resolve(Array.prototype.slice.call(arguments, 0));
                    });
                });
            });

            it('should pass when triggered', function() {
                action(1337, 'ninja');

                assert.eventually.deepEqual(storeListenPromise, [1337, 'ninja']);
            });

            describe('and unsubscribed', function() {
                beforeEach(function () {
                    unsubStoreCallback();
                });

                it('shouldn\'t have been called when action is called', function(done) {
                    var resolved = false;
                    storeListenPromise.then(function() {
                        resolved = true;
                    });

                    action(1337, 'ninja');

                    setTimeout(function() {
                      assert.isFalse(resolved);
                      done();
                    }, 20);
                });
            });
        });
    });

    describe('with one store listening to another store', function() {
        var action,
            baseStore;

        beforeEach(function () {
            action = new airflux.SimpleAction();
            baseStore = class extends airflux.Store {
                constructor() {
                    super();
                    this.listenTo(action, this.actionCalled);
                }

                actionCalled() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    this.trigger(args);
                }
            };
        });

        function createPromiseForTest(store) {
            return new Promise(function(resolve) {
                var storeTriggered = function (args) {
                    args = args.map(function (arg) {
                      return '[...] ' + arg;
                    });
                    this.trigger(args);
                    resolve(args);
                };
                class _cl extends airflux.Store {
                    constructor() {
                        super();
                        this.listenTo(store, this.storeTriggered, storeTriggered);
                    }
                }
                _cl.prototype.storeTriggered = storeTriggered;

                new _cl();
            });
        }

        it('should be triggered with argument from upstream store', function() {
            var promise = createPromiseForTest(new baseStore());
            action('my argument');
            return assert.eventually.equal(promise, '[...] my argument');
        });

        it('should be triggered with arbitrary arguments from upstream store', function() {
            var promise = createPromiseForTest(new baseStore());
            action(1337, 'ninja');
            return assert.eventually.deepEqual(promise, ['[...] 1337', '[...] ninja']);
        });

        it('should get initial state from getter state', function() {
            var store = new class extends baseStore {
                get state() {
                    return ['initial state'];
                }
            }();
            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] initial state');
        });

        it('should get initial state from getter state returned promise', function() {
            var store = new class extends baseStore {
                get state() {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(['initial state']);
                        }, 20);
                    });
                }
            }();

            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] initial state');
        });

    });

    describe("the listenToMany method",function(){
        describe("when given a single object",function(){
            var initialbarstate = "DEFAULTBARDATA",
                initialbazstate = "DEFAULTBAZDATA",
                listenables = {
                    foo: {listen:sinon.spy()},
                    bar: {
                        listen:sinon.spy()
                    },
                    baz: {
                        listen:sinon.spy()
                    },
                    missing: {
                        listen:sinon.spy()
                    }
                };

                var barState = sinon.stub().returns(initialbarstate);
                var bazState = sinon.stub().returns(initialbazstate);
                Object.defineProperty( listenables.bar, 'state', { get: barState } );
                Object.defineProperty( listenables.baz, 'state', { get: bazState } );

                class _cl extends airflux.Store {
                    constructor() {
                        super();
                        this.listenToMany( listenables );
                    }
                }

                _cl.prototype.onFoo = "methodFOO";
                _cl.prototype.bar = sinon.spy();
                _cl.prototype.onBaz = sinon.spy();
                _cl.prototype.onBazDefault = sinon.spy();

                var store = new _cl();

            it("should listenTo all listenables with the corresponding callbacks",function(){
                assert.deepEqual(listenables.foo.listen.firstCall.args,[store.onFoo,store]);
                assert.deepEqual(listenables.bar.listen.firstCall.args,[store.bar,store]);
                assert.deepEqual(listenables.baz.listen.firstCall.args,[store.onBaz,store]);
            });

            it("should not try to listen to actions without corresponding props in the store",function(){
                assert.equal(listenables.missing.listen.callCount,0);
            });

            it("should call main callback if listenable has gettter state but listener has no default-specific cb",function(){
                assert.equal(barState.callCount,2);
                assert.equal(store.bar.firstCall.args[0],initialbarstate);
            });

            it("should call default callback if exist and listenable has getter state",function(){
                assert.equal(bazState.callCount,2);
                assert.equal(store.onBaz.callCount,0);
                assert.equal(store.onBazDefault.firstCall.args[0],initialbazstate);
            });
        });
    });


    describe('getters', function() {
        var didRun = false;

        new class extends airflux.Store {
            get dontRunMe() {
                didRun = true;
            }
        }();

        it('should not be invoked during store creation', function() {
            return assert.isFalse(didRun);
        });
    });
});
