var chai = require('chai'),
    assert = chai.assert;

import Action from '../src/Action';
import Store from '../src/Store';


chai.use(require('chai-as-promised'));

describe('Creating stores', () => {
    describe('to test state mutation functions', () => {
        var store;

        beforeEach( () => {
            class AnonStore extends Store {
                state = { name: 'John' };
            }

            store = new AnonStore();
        });

        it('should create new key in the state', () => {
            store.setState( { foo: 'bar' } );
            return assert.equal( store.state.foo, 'bar' );
        });

        it('should overwrite existing value', () => {
            store.setState( { name: 'John Doe' } );
            return assert.equal( store.state.name, 'John Doe' );
        });

        it('should accept a function to modify the state', () => {
            store.setState( s => {
                s.name = 'Jane';
                return s;
            } );
            return assert.equal( store.state.name, 'Jane' );
        });
    });

    describe('with one store listening to a simple action', () => {
        var action,
            store,
            promise,
            unsubCallback;

        beforeEach( () => {
            var StoreMethods = {};

            promise = new Promise( ( resolve ) => {
                action = new Action().asFunction;
                class AnonStore extends Store {
                    constructor() {
                        super();
                        unsubCallback = this.listenTo(action, this.actionCalled);
                    }

                    actionCalled( ...args ) {
                        this.trigger( args );
                        resolve( args );
                    }
                }

                store = new AnonStore();
            });
        });

        it('should get argument given on action', () => {
            action( 'my argument' );
            return assert.eventually.equal( promise, 'my argument' );
        });

        it('should get any arbitrary arguments given on action', () => {
            action( 1337, 'ninja' );
            return assert.eventually.deepEqual( promise, [1337, 'ninja'] );
        });

        it( 'should throw an error when it listens on itself', () => {
            assert.throws( () => store.listenTo( store, () => 0 ), Error );
        });

        describe( 'and with listener unsubscribed', () => {
            beforeEach( () =>unsubCallback.stop() );

            it( 'shouldn\'t have been called when action is called', ( done ) => {
                var resolved = false;
                promise.then( () => resolved = true );

                action( 1337, 'ninja' );

                setTimeout( () => {
                  assert.isFalse(resolved);
                  done();
                }, 20 );
            });

            it( 'can listenTo the same action again', () => {
                store.listenTo( action, store.actionCalled );
                action( 1337, 'ninja' );
                return assert.eventually.deepEqual(promise, [1337, 'ninja']);
            } );

        });

        it('should be able to reuse action again further down the chain', () => {
            new class extends Store {
                constructor() {
                    super();

                    this.listenTo(store, this.trigger);
                    this.listenTo(action, this.trigger);
                }
            }();

            action( 1337 );

            return assert.eventually.deepEqual( promise, [1337] );
        });

        describe('listening to the store', () => {
            var unsubStoreCallback, storeListenPromise;

            beforeEach( () => {
                storeListenPromise = new Promise( ( resolve ) => {
                    unsubStoreCallback = store.listen( () => {
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
            action = new Action().asFunction;
            baseStore = class extends Store {
                constructor() {
                    super();
                    this.listenTo(action, this.actionCalled);
                }

                actionCalled( ...args ) {
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
                class _cl extends Store {
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
/*
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

                class _cl extends Store {
                    constructor() {
                        super();
                        this.listenToMany( listenables );
                    }
                }

                _cl.prototype.onFoo = "methodFOO";
                _cl.prototype.bar = sinon.spy();
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
*/

    describe('getters', function() {
        var didRun = false;

        new class extends Store {
            get dontRunMe() {
                didRun = true;
            }
        }();

        it('should not be invoked during store creation', function() {
            return assert.isFalse(didRun);
        });
    });
});
