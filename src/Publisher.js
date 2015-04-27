var _ = require('./utils');


/**
 * @constructor
 */
class Publisher {
    /*:: emitter            : any;*/
    /*:: children           : Array< any >;*/
    /*:: _dispatchPromises  : Array< any >;*/


    /**
     * @protected
     */
    constructor() {
        this.emitter = new _.EventEmitter();
        this.children = [];
        this._dispatchPromises = [];
    }

    get eventType()/*:string*/ { return 'event'; }
    get isPublisher()/*:boolean*/ { return true; }


    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit() {}

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit()/*:boolean*/ {
        return true;
    }

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen( callback/*:Function*/, bindContext )/*:?Function*/ {
        var aborted = false;
        bindContext = bindContext || this;

        var eventHandler = ( args ) => {
            if (aborted) {
                // This state is achieved when one listener removes another.
                //   It might be considered a bug of EventEmitter2 which makes
                //   a snapshot of the listener list before looping through them
                //   and effectively ignores calls to removeListener() during emit.
                // TODO: Needs a test.
                return;
            }

            var result = callback.apply( bindContext, args );
            if (_.isPromise(result)) {
                // Note: To support mixins, we need to access the method this way.
                //   Overrides are not possible.
                //
                //  TODO: check if we still need this with classes/do we allow override ?
                var canHandlePromise/*:boolean*/ = Publisher.prototype.canHandlePromise.call( this );
                if (!canHandlePromise) {
                    console.warn('Unhandled promise for ' + this.eventType);
                    return;
                }

                this._dispatchPromises.push({
                    promise: result,
                    listener: callback
                });
            }
        };
        this.emitter.addListener( this.eventType, eventHandler );

        return () => {
            aborted = true;
            this.emitter.removeListener( this.eventType, eventHandler );
        };
    }


    listenOnce( callback/*:Function*/, bindContext )/*:Function*/ {
        bindContext = bindContext || this;
        var unsubscribe = this.listen( () => {
            var args = Array.prototype.slice.call(arguments);
            unsubscribe();
            return callback.apply( bindContext, args );
        });
        return unsubscribe;
    }

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} The promise to attach to
     */
    promise( promise ) {
        var canHandlePromise/*:boolean*/ =
            this.children.indexOf('completed') >= 0 &&
            this.children.indexOf('failed') >= 0;

        if (!canHandlePromise){
            throw new Error('Publisher must have "completed" and "failed" child publishers');
        }

        promise.then( ( response ) => this.completed.asFunction( response ) )
               .catch( ( error ) => this.failed.asFunction( error ) );
    }

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} promise The result to use or a promise to which to listen.
     */
     // TODO: MOVE TO ACTION
     // as calling completed and failed is completely specific to an action, this should be moved to the Action class.
    resolve( promise ) {
        // Note: To support mixins, we need to access the method this way.
        //   Overrides are not possible.
        var canHandlePromise/*:boolean*/ = Publisher.prototype.canHandlePromise.call(this);
        if (!canHandlePromise) {
            throw new Error('Not an async publisher');
        }

        if( !_.isPromise( promise ) ) {
            this.completed.asFunction( promise );
            return;
        }

        promise.then( ( response ) => this.completed.asFunction( response ), ( error ) => this.failed.asFunction( error ) );
    }


    reject( result ) {
        if( _.isPromise( result ) ) {
            console.warn('Use #resolve() for promises.');
            return;
        }

        this.failed( result );
    }


    then( onSuccess, onFailure ) {
        // Note: To support mixins, we need to access the method this way.
        //   Overrides are not possible.
        var canHandlePromise/*:boolean*/ = Publisher.prototype.canHandlePromise.call(this);
        if (!canHandlePromise) {
            throw new Error('Not an async publisher');
        }

        if( onSuccess ) {
            this.completed.listenOnce( onSuccess );
        }
        if( onFailure ) {
            this.failed.listenOnce( onFailure );
        }
    }


    catch( onFailure ) {
        this.then(null, onFailure);
    }


    canHandlePromise()/*:boolean*/ {
        return this.completed && this.failed;// && this.completed._isActionFunctor && this.failed._isActionFunctor;
    }

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    triggerSync() {
        var args = arguments;
        var preResult = this.preEmit.apply( this, args );
        if( typeof preResult !== 'undefined' ) {
            args = _.isArguments(preResult) ? preResult : [].concat(preResult);
        }

        if( this.shouldEmit.apply( this, args ) ) {
            this._dispatchPromises = [];
            this.emitter.emit(this.eventType, args);
            // Note: To support mixins, we need to access the method this way.
            //   Overrides are not possible.
            Publisher.prototype._handleDispatchPromises.call(this);
        }
    }

    /**
     * Tries to publish the event on the next tick
     */
    trigger() {
        var args = arguments;
        _.nextTick( () => this.triggerSync.apply( this, args ) );
    }

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise() {
        // Note: To support mixins, we need to access the method this way.
        //   Overrides are not possible.
        var canHandlePromise = Publisher.prototype.canHandlePromise.call(this);
        if (!canHandlePromise) {
            throw new Error('Publisher must have "completed" and "failed" child publishers');
        }

        var self = this;
        var args = arguments;

        var promise = new Promise(function( resolve, reject ) {
            var removeSuccess = self.completed.listen( ( args ) => {
                removeSuccess();
                removeFailed();
                resolve(args);
            });

            var removeFailed = self.failed.listen( ( args ) => {
                removeSuccess();
                removeFailed();
                reject(args);
            });

            self.trigger.apply( this, args );
        });

        return promise;
    }

    /**
     * @private
     */
    _handleDispatchPromises() {
        var promises = this._dispatchPromises;
        this._dispatchPromises = [];

        if (promises.length === 0) {
            return;
        }
        if (promises.length === 1) {
            return this.resolve(promises[0].promise);
        }

        var mappedPromises = promises.map(function (item) {
            return item.promise.then( ( result ) => {
                return {
                    listener: item.listener,
                    value: result
                };
            });
        });

        var joinedPromise = Promise.all(mappedPromises);
        return this.resolve(joinedPromise);
    }
}   // class Publisher


module.exports = Publisher;
