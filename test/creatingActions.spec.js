var chai    = require('chai');
var assert  = chai.assert;


import Action               from '../src/Action';
import AsyncResultAction    from '../src/AsyncResultAction';
import PromiseAction        from '../src/PromiseAction';
import SyncAction           from '../src/SyncAction';
import Store                from '../src/Store';
import Listener             from '../src/Listener';


//var sinon   = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {
    it("should create specified child actions",function(){
        var action = new Action().withChildren( ["foo","BAR"] );

        assert.instanceOf( action.foo, Action );
        assert.instanceOf( action.BAR, Action );
        assert.isFunction( action.foo.listen );
        assert.isFunction( action.BAR.listen );

        assert.deepEqual( Object.keys( action.children ), [ 'foo', 'BAR' ] );
    });

    it("should create specified custom child actions",function(){
        var barAction = new Action( true );
        var action = new Action().withChildren( [ [ 'BAR', barAction ] ] );

        assert.instanceOf( action.BAR, Action );
        assert.equal( action.children.BAR, barAction );
    });

    it("should create completed and failed child actions for async actions",function(){
        var action = new AsyncResultAction();

        assert.instanceOf( action.completed, Action);
        assert.instanceOf( action.failed, Action );
        assert.isFunction( action.completed.listen );
        assert.isFunction( action.failed.listen );

        var functor = action.asFunction;
        assert.isFunction( functor.completed );
        assert.isFunction( functor.failed );
        assert.equal( functor.completed._isActionFunctor, true );
        assert.equal( functor.failed._isActionFunctor, true );
    });

    it("should create a functor returning a Promise-like for Action with async results",function(){
        var action = new PromiseAction( () => new Promise( ( resolve ) => setTimeout( resolve, 500 ) ) );
        var functor = action.asFunction;
        var spy = sinon.spy();
        functor().then( spy );

        setTimeout( () => assert.equal( spy.callCount, 1 ), 1000 );
    });

    it("should add completed and failed child functors on the functor of async actions",function(){
        var functor = new AsyncResultAction().asFunction;

        assert.isFunction( functor.completed );
        assert.isFunction( functor.failed );
        assert.equal( functor.completed._isActionFunctor, true );
        assert.equal( functor.failed._isActionFunctor, true );
        assert.instanceOf( functor.completed.action, Action);
        assert.instanceOf( functor.failed.action, Action );
        assert.isFunction( functor.completed.listen );
        assert.isFunction( functor.failed.listen );
    });

    var action,
        testArgs;

    beforeEach(function () {
        action = new Action().asFunction;
        testArgs = [1337, 'test'];
    });

    it('should be a callable functor', function() {
        assert.isFunction(action);
        assert.equal( action._isActionFunctor, true );
    });


    describe("the synchronisity",function(){
        var syncaction = new SyncAction().asFunction,
            asyncaction = new Action().asFunction,
            synccalled = false,
            asynccalled = false;

        var store = new class extends Store {
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
        var syncaction = new Action().asSyncFunction,
            asyncaction = new Action().asFunction,
            synccalled = false,
            asynccalled = false;

        var store = new class extends Store {
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
            var action = new Action();
            action.preEmit = sinon.spy();

            action.asFunction(1337,'test');

            it('should receive arguments from action functor', function() {
                assert.deepEqual( action.preEmit.firstCall.args,[1337,'test'] );
            });
        });

        describe('when adding shouldEmit hook',function(){
            describe("when hook returns true",function(){
                var shouldEmit = sinon.stub().returns(true),
                    action = new Action(),
                    callback = sinon.spy();

                action.shouldEmit = shouldEmit;

                var listener = new Listener();
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
                    action = new Action(),
                    callback = sinon.spy();
                action.shouldEmit = shouldEmit;

                var listener = new Listener();
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
            foo: new AsyncResultAction(),
            bar: new Action().withChildren( ['baz'] )
        };
    });

    it('should contain foo and bar properties', function() {
        assert.property(actions, 'foo');
        assert.property(actions, 'bar');
    });

    it('should contain Action on foo and bar properties with children', function() {
        assert.instanceOf( actions.foo, Action );
        assert.instanceOf( actions.bar, Action );
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

        assert.instanceOf( actions.foo.completed, Action);
        assert.instanceOf( actions.foo.failed, Action);
        assert.instanceOf( actions.bar.baz, Action);
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
            // listen for foo and return a promise
            actions.promisedFoo = new PromiseAction( function() {
                var args = Array.prototype.slice.call(arguments, 0);

                var p = new Promise( function( resolve ) {
                    setTimeout(function() {
                        resolve(args);
                    }, 0);
                });

                return p;
            });

            // promise resolves on foo.completed
            promise = new Promise(function(resolve) {
                actions.promisedFoo.completed.listen(function(){
                    resolve.apply(null, arguments);
                }, {}); // pass empty context
            });
        });

        it('should invoke the completed action with the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.promisedFoo.trigger( testArgs[0], testArgs[1] );

            return assert.eventually.deepEqual(promise, testArgs);
        });
    });
});

describe('Creating multiple actions to an action definition object', function() {

    var actions;

    beforeEach(function () {
        actions = {
            foo: new Action().asFunction,
            bar: new Action().asFunction
        };
    });

    it('should contain action functor on foo and bar properties', function() {
        assert.isFunction(actions.foo);
        assert.isFunction(actions.bar);
    });

    it('functors shoudl have the original action as property', function() {
        assert.instanceOf(actions.foo.action, Action);
        assert.instanceOf(actions.bar.action, Action);
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
