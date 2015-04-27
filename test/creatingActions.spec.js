var chai    = require('chai');
var assert  = chai.assert;
var airflux = require('../src');
var sinon   = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {
    it("should create specified child actions",function(){
        var action = new airflux.Action().withChildren( ["foo","BAR"] );

        assert.instanceOf( action.foo, airflux.Action );
        assert.instanceOf( action.BAR, airflux.Action );
        assert.isFunction( action.foo.listen );
        assert.isFunction( action.BAR.listen );

        assert.deepEqual( Object.keys( action.children ), [ 'foo', 'BAR' ] );
    });

    it("should create specified custom child actions",function(){
        var barAction = new airflux.Action( true );
        var action = new airflux.Action().withChildren( [ [ 'BAR', barAction ] ] );

        assert.instanceOf( action.BAR, airflux.Action );
        assert.equal( action.children.BAR, barAction );
    });

    it("should create completed and failed child actions for async actions",function(){
        var action = new airflux.Action().asyncResult();

        assert.instanceOf( action.completed, airflux.Action);
        assert.instanceOf( action.failed, airflux.Action );
        assert.isFunction( action.completed.listen );
        assert.isFunction( action.failed.listen );

        var functor = action.asFunction;
        assert.isFunction( functor.completed );
        assert.isFunction( functor.failed );
        assert.equal( functor.completed._isActionFunctor, true );
        assert.equal( functor.failed._isActionFunctor, true );
    });


    it("should add completed and failed child functors on the functor of async actions",function(){
        var functor = new airflux.Action().asyncResult().asFunction;

        assert.isFunction( functor.completed );
        assert.isFunction( functor.failed );
        assert.equal( functor.completed._isActionFunctor, true );
        assert.equal( functor.failed._isActionFunctor, true );
        assert.instanceOf( functor.completed.action, airflux.Action);
        assert.instanceOf( functor.failed.action, airflux.Action );
        assert.isFunction( functor.completed.listen );
        assert.isFunction( functor.failed.listen );
    });

    var action,
        testArgs;

    beforeEach(function () {
        action = new airflux.SimpleAction();
        testArgs = [1337, 'test'];
    });

    it('should be a callable functor', function() {
        assert.isFunction(action);
        assert.equal( action._isActionFunctor, true );
    });


    describe("the synchronisity",function(){
        var syncaction = new airflux.SimpleAction( true ),
            asyncaction = new airflux.SimpleAction(),
            synccalled = false,
            asynccalled = false;

        var store = new class extends airflux.Store {
            constructor() {
                super();
                this.listenTo( syncaction, this.sync );
                this.listenTo( asyncaction, this.async );
            }

            sync(){synccalled=true;}
            async(){asynccalled=true;}
        }();


        it("should be asynchronous when not specified",function(){
            asyncaction();
            assert.equal(false,asynccalled);
        });

        it("should be synchronous if requested",function(){
            syncaction();
            assert.equal(true,synccalled);
        });
    });



    describe("the synchronisity using Action with asFunction",function(){
        var syncaction = new airflux.Action().asSyncFunction,
            asyncaction = new airflux.Action().asFunction,
            synccalled = false,
            asynccalled = false;

        var store = new class extends airflux.Store {
            constructor() {
                super();
                this.listenTo( syncaction, this.sync );
                this.listenTo( asyncaction, this.async );
            }

            sync(){synccalled=true;}
            async(){asynccalled=true;}
        }();


        it("should be asynchronous when not specified",function(){
            asyncaction();
            assert.equal(false,asynccalled);
        });

        it("should be synchronous if requested",function(){
            syncaction();
            assert.equal(true,synccalled);
        });
    });



    describe('when listening to action', function() {
        var promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                action.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });
        });

        it('should receive the correct arguments', function() {
            action(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

        describe('when adding preEmit hook', function() {
            var action = new airflux.Action();
            action.preEmit = sinon.spy();

            action.asFunction(1337,'test');

            it('should receive arguments from action functor', function() {
                assert.deepEqual( action.preEmit.firstCall.args,[1337,'test'] );
            });
        });

        describe('when adding shouldEmit hook',function(){
            describe("when hook returns true",function(){
                var shouldEmit = sinon.stub().returns(true),
                    action = new airflux.Action(),
                    callback = sinon.spy();

                action.shouldEmit = shouldEmit;

                var listener = new airflux.Listener();
                listener.listenTo( action, callback );

                action.trigger( 1337,'test' );

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should still trigger to listeners',function(){
                    assert.equal(callback.callCount,1);
                    assert.deepEqual(callback.firstCall.args,[1337,'test']);
                });

            });

            describe("when hook returns false",function(){
                var shouldEmit = sinon.stub().returns(false),
                    action = new airflux.Action(),
                    callback = sinon.spy();
                action.shouldEmit = shouldEmit;

                var listener = new airflux.Listener();
                listener.listenTo( action, callback );
                action.trigger( 1337, 'test' );

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should not trigger to listeners',function(){
                    assert.equal(callback.callCount,0);
                });
            });
        });
    });

});

describe('Creating actions with children to an action definition object', function() {
    var actions;

    beforeEach(function () {
        actions = {
            foo: new airflux.Action().asyncResult(),
            bar: new airflux.Action().withChildren( ['baz'] )
        };
    });

    it('should contain foo and bar properties', function() {
        assert.property(actions, 'foo');
        assert.property(actions, 'bar');
    });

    it('should contain Action on foo and bar properties with children', function() {
        assert.instanceOf( actions.foo, airflux.Action );
        assert.instanceOf( actions.bar, airflux.Action );
    });

    it('should contain Action functor on foo and bar children', function() {
/*        assert.isFunction( actions.foo.completed );
        assert.isFunction( actions.foo.failed );
        assert.isFunction( actions.bar.baz );

        assert.equal( actions.foo.completed._isActionFunctor, true );
        assert.equal( actions.foo.failed._isActionFunctor, true );
        assert.equal( actions.bar.baz._isActionFunctor, true );
*/
        assert.isFunction( actions.foo.completed.listen );
        assert.isFunction( actions.foo.failed.listen );
        assert.isFunction( actions.bar.baz.listen );

        assert.instanceOf( actions.foo.completed, airflux.Action);
        assert.instanceOf( actions.foo.failed, airflux.Action);
        assert.instanceOf( actions.bar.baz, airflux.Action);
    });

    describe('when listening to the child action created this way', function() {
        var promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                actions.bar.baz.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                }, {}); // pass empty context
            });
        });

        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.bar.baz.trigger( testArgs[0], testArgs[1] );

            return assert.eventually.deepEqual(promise, testArgs);
        });
    });

    describe('when promising an async action created this way', function() {
        var promise;

        beforeEach(function() {
            // promise resolves on foo.completed
            promise = new Promise(function(resolve) {
                actions.foo.completed.listen(function(){
                    resolve.apply(null, arguments);
                }, {}); // pass empty context
            });

            // listen for foo and return a promise
            actions.foo.listen(function() {
                var args = Array.prototype.slice.call(arguments, 0);

                var p = new Promise( function( resolve ) {
                    setTimeout(function() {
                        resolve(args);
                    }, 0);
                });

                return p;
            });
        });

        it('should invoke the completed action with the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.foo.trigger( testArgs[0], testArgs[1] );

            return assert.eventually.deepEqual(promise, testArgs);
        });
    });
});

describe('Creating multiple actions to an action definition object', function() {

    var actions;

    beforeEach(function () {
        actions = {
            foo: new airflux.SimpleAction(),
            bar: new airflux.SimpleAction()
        };
    });

    it('should contain action functor on foo and bar properties', function() {
        assert.isFunction(actions.foo);
        assert.isFunction(actions.bar);
    });

    it('functors shoudl have the original action as property', function() {
        assert.instanceOf(actions.foo.action, airflux.Action);
        assert.instanceOf(actions.bar.action, airflux.Action);
    });

    describe('when listening to any of the actions created this way', function() {

        var promise;

        beforeEach(function() {
            promise = new Promise(function(resolve) {
                actions.foo.listen(function() {
                    assert.equal(this, actions.foo.action);
                    resolve(Array.prototype.slice.call(arguments, 0));
                }); // not passing context, should default to action
            });
        });

        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.foo(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

    });

});
