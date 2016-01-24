var assert = require('chai').assert,
    fn = function(){};

import Action from '../src/Action';
import SyncAction from '../src/SyncAction';
import Store from '../src/Store';


describe('Stopping',function(){
    describe('listening to a publisher that\'s only part of a join',function(){
        var store = new Store(),
            action1 = new Action().asFunction,
            action2 = new Action().asFunction;
        store.joinTrailing( () => 0, action1, action2 );
        it('should fail',function(){
            assert.equal(store.stopListeningTo(action1),false);
            assert.equal(store._subscriptions.length,1);
        });
    });
    describe('a join',function(){
        var store = new Store(),
            action1 = new SyncAction().asFunction,
            action2 = new SyncAction().asFunction,
            action3 = new SyncAction().asFunction,
            indivcallback = sinon.spy(),
            joincallback = sinon.spy(),
            subobj;
        store.listenTo( action2, indivcallback );
        subobj = store.joinLeading( joincallback, action1, action2, action3);
        subobj.stop();

        action1( "A" );
        action2( "B" );
        action3( "C" );

        it('should leave the individual listening intact',function(){
            assert.equal( store._subscriptions.length, 1 );
            assert.equal( store._subscriptions[0].listenable, action2 );
            action2( "foo", "bar" );
            assert.deepEqual( ["foo","bar"], indivcallback.lastCall.args );
        });
        it('should not fire join callback anymore',function(done){
            setTimeout(function(){
                assert.equal(joincallback.callCount,0);
                done();
            },10);
        });
    });
    describe('a single listen', function(){
        describe('by calling stop directly',function(){
            describe('when all is well',function(){
                var store = new Store(),
                    action1 = new Action().asFunction,
                    action3 = new Action().asFunction;
                store.listenTo(action1,fn);
                store.listenTo(new Action(),fn);
                store.listenTo(action3,fn);
                it('should remove that listener from the list but keep the others',function(){
                    store._subscriptions[1].stop();
                    assert.equal(2,store._subscriptions.length);
                    assert.equal(action1,store._subscriptions[0].listenable);
                    assert.equal(action3,store._subscriptions[1].listenable);
                });
            });
            describe('when the listener has already been removed from the list somehow',function(){
                var store = new Store();
                store.listenTo(new Action().asFunction,fn);
                store.listenTo(new Action().asFunction,fn);
                it('should throw an error',function(){
                    assert.throws(function(){
                        store._subscriptions.pop().stop();
                    });
                });
            });
        });
        describe('by using stopListenTo',function(){
            describe('when all is well',function(){
                var store = new Store(),
                    action1 = new Action().asFunction,
                    action2 = new Action().asFunction,
                    action3 = new Action().asFunction;
                store.listenTo(action1,fn);
                store.listenTo(action2,fn);
                store.listenTo(action3,fn);
                var result = store.stopListeningTo(action2);
                it('should remove that listener from the list but keep the others',function(){
                    assert.equal(2,store._subscriptions.length);
                    assert.equal(action1,store._subscriptions[0].listenable);
                    assert.equal(action3,store._subscriptions[1].listenable);
                });
                it('should return true',function(){
                    assert.equal(true,result);
                });
            });
            describe('when the stop method won\'t remove it from the array',function(){
                var store = new Store(),
                    action = new Action().asFunction;
                store.listenTo(action,fn);
                store._subscriptions[0].stop = fn;
                it('should throw an error',function(){
                    assert.throws(function(){
                        store.stopListeningTo(action);
                    });
                });
            });
            describe('when we weren\'t actually listening to the given listenable',function(){
                var action1 = new Action().asFunction,
                    action2 = new Action().asFunction,
                    store = new Store(),
                    result;
                store.listenTo( action1, () => 0 );
                store.listenTo( action2, () => 0 );
                result = new Store().stopListeningTo(new Action().asFunction);
                it('should return false',function(){
                    assert.equal(false,result);
                });
                it('should leave the other listens intact',function(){
                    assert.equal(2,store._subscriptions.length);
                    assert.equal(action1,store._subscriptions[0].listenable);
                    assert.equal(action2,store._subscriptions[1].listenable);
                });
            });

            // TODO: I'm not sure this test is of any relevance at all..
            describe('when we don\'t have a subscriptions list',function(){
                var store = new Store(), result;
                delete store._subscriptions;
                result = store.stopListeningTo(new Action());
                it('should return false',function(){
                    assert.equal(result,false);
                });
            });
        });
    });
    describe('all listens',function(){
        describe('when all is well',function(){
            var store = new Store();
            store.listenTo(new Action().asFunction,fn);
            store.listenTo(new Action().asFunction,fn);
            it('should clear the subscriptions list',function(){
                store.stopListeningToAll();
                assert.deepEqual([],store._subscriptions);
            });
        });
/*        describe('when a stop fails to remove the subscription object from the list',function(){
            var store = new Store();
            store.listenTo(new Action().asFunction);
            store._subscriptions[0].stop = fn;
            it('should throw an error',function(){
                assert.throws(function(){
                    store.stopListeningToAll();
                });
            });
        });*/
        describe('when we don\'t have a subscriptions list',function(){
            var store = new Store();
            delete store._subscriptions;
            it('should be a noop',function(){
                store.stopListeningToAll();
            });
        });
    });
});
