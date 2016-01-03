var assert  = require('chai').assert;

import Action from '../src/Action';
import Store from '../src/Store';



//var sinon   = require('sinon');

describe('using joins',function(){
    describe('with instance methods',function(){
        describe('when validation fails',function(){
            var store = new Store(),
                action1 = { listen:sinon.spy() },
                action2 = { listen:sinon.spy() },
                action3 = { listen:sinon.spy() };
            store.validateListening = sinon.stub().returns('ERROR! ERROR!');

            it('should throw an error and not set any listens',function(){
                assert.throws(function(){
                    store.joinTrailing( () => 0, action1, action2, action3 );
                });
                assert.equal(0,action1.listen.callCount);
                assert.equal(0,action2.listen.callCount);
                assert.equal(0,action3.listen.callCount);
            });
        });
        describe('keeping trailing arguments',function(){
            var action1 = new Action().asFunction,
                action2 = new Action().asFunction,
                action3 = new Action().asFunction,
                store = new Store(),
                callback = sinon.spy(),
                validate = sinon.spy(),
                result;
            store.validateListening = validate;
            result = store.joinTrailing( callback, action1, action2, action3);
            action1('a');
            action2('b');
            action1('x');
            action3('c');
            it("should emit with the trailing arguments",function(){
                assert.deepEqual(callback.firstCall.args,[['x'],['b'],['c']]);
            });
            action1('1');
            action2('2');
            action1('11');
            action3('3');
            it("should emit again after all fire a second time",function(){
                assert.deepEqual(callback.secondCall.args,[['11'],['2'],['3']]);
            });
            action1('FOO');
            action3('BAR');
            it("should not emit a third time since not all fired three times",function(){
                assert.equal(callback.callCount,2);
            });
            it("should return a subscription object with stop function and listenable array",function(){
                assert.deepEqual( [ action1, action2, action3 ], result.listenable );
                assert.isFunction( result.stop );
            });
            it("should add the returned subscription object to the context subscriptions array",function(){
                assert.equal(1,store.subscriptions.length);
                assert.equal(result,store.subscriptions[0]);
            });
            it("should validate each individual listenable in the join",function(){
                assert.equal(3,validate.callCount);
                assert.equal(action1,validate.firstCall.args[0]);
                assert.equal(action2,validate.secondCall.args[0]);
                assert.equal(action3,validate.thirdCall.args[0]);
            });
        });
        describe('keeping leading arguments',function(){
            var action1 = new Action().asFunction,
                action2 = new Action().asFunction,
                action3 = new Action().asFunction,
                store = new Store(),
                spy = sinon.spy();
            store.joinLeading( spy, action1, action2, action3 );
            action1('a');
            action2('b');
            action1('x');
            action3('c');
            it("should emit with the leading arguments",function(){
                assert.equal(spy.callCount,1);
                assert.deepEqual(spy.firstCall.args,[['a'],['b'],['c']]);
            });
        });
        describe('concatenating arguments',function(){
            var action1 = new Action().asFunction,
                action2 = new Action().asFunction,
                action3 = new Action().asFunction,
                store = new Store(),
                spy = sinon.spy();
            store.joinConcat( spy, action1, action2, action3 );
            action1('a');
            action2('b');
            action1('x');
            action3('c');
            it("should emit with the concatenated arguments",function(){
                assert.equal(spy.callCount,1);
                assert.deepEqual(spy.firstCall.args,[[['a'],['x']],[['b']],[['c']]]);
            });
        });
        describe('strictly joining arguments',function(){
            var action1,
                action2,
                action3,
                store,
                spy;

            beforeEach(function () {
                action1 = new Action( true ).asFunction;
                action2 = new Action( true ).asFunction;
                action3 = new Action( true ).asFunction;
                store = new Store();
                spy = sinon.spy();
                store.joinStrict( spy, action1, action2, action3 );
            });

            it("should emit with the arguments",function(done){
                action1( 'a' );
                action2( 'b' );
                action3( 'c' );

                setTimeout( () => {
                    assert.equal( spy.callCount, 1 );
                    assert.deepEqual( spy.firstCall.args, [['a'],['b'],['c']] );
                    done();
                }, 100 );
            });
            it("should throw error if triggered more than once",function(){
                action1('a'); // sync trigger to be able to test
                assert.throws(function(){
                    action1.triggerSync('x');
                });
            });
        });
        describe('with less than 2 participants in the join',function(){
            it('should fail',function(){
                assert.throws(function(){
                    new Store().joinConcat( () => 0, new Action().asFunction );
                });
                assert.throws(function(){
                    new Store().joinConcat( () => 0 );
                });
            });
        });
    });
});
