var chai = require('chai'),
    assert = chai.assert,
    airflux = require('../src');

chai.use(require('chai-as-promised'));

var slice = Array.prototype.slice;

describe('Creating aggregate stores', function() {

    describe('with one aggregate store listening to a store listening to a simple action', function() {
        var action,
            store,
            aggregateStore,
            promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                action = new airflux.SimpleAction();
                store = new class extends airflux.Store {
                    constructor() {
                        super();
                        this.listenTo(action, this.triggerSync);
                        // pass to the triggerSync function immediately
                    }
                }();
                aggregateStore = new class extends airflux.Store {
                    constructor() {
                        super();
                        this.listenTo(store, this.storeCalled);
                    }
                    storeCalled() {
                        resolve(slice.call(arguments, 0));
                    }
                }();
            });
        });

        it('should get argument given by action', function() {
            action('my argument');

            return assert.eventually.deepEqual(promise, ['my argument']);
        });

        it('should get any arbitrary arguments given on action', function() {
            action(1337, 'ninja');

            return assert.eventually.deepEqual(promise, [1337, 'ninja']);
        });

        it('should throw error when circular dependency happens', function() {
            assert.throws(function() {
                store.listenTo(aggregateStore);
            }, Error);
        });

        describe('with a third store', function() {
            var thirdStore;

            beforeEach(function() {
                thirdStore = new airflux.Store();
                thirdStore.listenTo(aggregateStore, function() {});
            });

            it('should throw error when a longer circular dependency happens', function() {
                assert.throws(function() {
                    store.listenTo(thirdStore, function() {});
                });
            });


        });
    });

});
