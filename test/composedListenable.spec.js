var chai = require('chai'),
    assert = chai.assert,
    airflux = require('../src');

chai.use(require('chai-as-promised'));

describe('Composed listenables', function() {
    var action1,
        action2,
        action3,
        all;

    beforeEach(function() {
        action1 = new airflux.SimpleAction();
        action2 = new airflux.SimpleAction();
        action3 = new airflux.SimpleAction();
        all = airflux.all(action1, action2, action3);
    });


    it('should emit when all listenables emit', function() {
        var promise = new Promise(function(resolve) {
            all.listen(function() {
                resolve(Array.prototype.slice.call(arguments, 0));
            });
        });

        action1('a', 'x');
        action2('b', 'y');
        action3('c', 'z');

        return assert.eventually.deepEqual(promise, [
            ['a', 'x'],
            ['b', 'y'],
            ['c', 'z']
        ]);
    });


    it('should not emit when only one listenable emits', function(done) {
        var called = false;
        all.listen(function() {
            called = true;
        }, null);

        action3('c');

        setTimeout(function() {
            assert.isFalse(called);
            done();
        }, 200);
    });


    it('should not emit when only two listenable emits', function(done) {
        var called = false;
        all.listen(function() {
            called = true;
        }, null);

        action1('a');
        action3('c');

        setTimeout(function() {
            assert.isFalse(called);
            done();
        }, 200);
    });


    it('should emit multiple times', function() {
        var promise = new Promise(function(resolve) {
            var callArgs = [];
            all.listen(function() {
                callArgs.push([].slice.call(arguments));
                if (callArgs.length === 2) {
                    resolve(callArgs);
                }
            });
        });

        action1('a');
        action2('b');
        action3('c');

        action1('x');
        action2('y');
        action3('z');

        return assert.eventually.deepEqual(promise, [
          [['a'], ['b'], ['c']],
          [['x'], ['y'], ['z']]
        ]);
    });


    it('should emit with the last arguments it received', function() {
        var promise = new Promise(function(resolve) {
          all.listen(function() {
              resolve(Array.prototype.slice.call(arguments, 0));
          });
        });

        action1('a');
        action2('b');
        action1('x');
        action3('c');

        return assert.eventually.deepEqual(promise, [
          ['x'],
          ['b'],
          ['c']
        ]);
    });
});

describe('Composed listenable with stores', function() {
    var action,
        store1,
        store2,
        all;

    beforeEach(function () {
        action = new airflux.Action();
        store1 = new class extends airflux.Store {
            constructor() {
                super();
                this.listenTo(action, this.triggerSync);
            }
        }();
        store2 = new class extends airflux.Store {
            constructor() {
                super();
                this.listenTo(action, this.triggerSync);
            }
        }();
        all = airflux.all(store1, store2);
    });

    it('should emit when action is invoked', function() {
        var promise = new Promise(function(resolve) {
            all.listen(function() {
                resolve(Array.prototype.slice.call(arguments, 0));
            });
        });

        action.asFunction('a');

        return assert.eventually.deepEqual(promise, [['a'], ['a']]);
    });

    describe('with a store listening to the combined listenable', function() {

        var storeAll;

        beforeEach(function () {
            storeAll = new class extends airflux.Store {
                constructor() {
                    super();
                    this.listenTo(all, this.triggerSync);
                }
            }();
        });

        it('should emit when action is invoked', function() {
            var promise = new Promise(function(resolve) {
                storeAll.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });

            action.asFunction('a');

            return assert.eventually.deepEqual(promise, [['a'], ['a']]);
        });

        it('should not be able to be listened to by a store in the combined listenable', function() {
            assert.throws(function() {
                store2.listenTo(storeAll, function() {});
            }, Error);
        });
    });

});
