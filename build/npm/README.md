# Airflux

A pure ES6 fork of the Reflux data flow library similar to [Facebook Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html).

---

You can read an overview of Flux [here](http://facebook.github.io/react/docs/flux-overview.html), however the gist of it is to introduce a more functional programming style architecture by eschewing MVC like pattern and adopting a single data flow pattern.

```
╔═════════╗       ╔════════╗       ╔═════════════════╗
║ Actions ║──────>║ Stores ║──────>║ View Components ║
╚═════════╝       ╚════════╝       ╚═════════════════╝
     ^                                      │
     └──────────────────────────────────────┘

```


## Content

- [Installation](#installation)
- [Comparing Airflux with Facebook Flux](#comparing-airflux-with-facebook-flux)
- [Examples](#examples)
- [Usage](#usage)
     - [Actions](#creating-actions)
     - [Stores](#creating-data-stores)
     - [Component](#react-component-example)
- [Advanced Usage](#advanced-usage)
- [Colophon](#colophon)

## Install/Download

The latest release is always downloadable from GitHub: [AlexJozwicki/airflux/releases](https://github.com/AlexJozwicki/airflux/releases).

[Back to top](#content)

## Yet another Flux library

The Airflux project is a ES6 class-based fork of Reflux, helped by the work done on Fluo.
The goal is to allow to create new projects entirely based on ES6 classes, both on the React side and Flux side.

Having a class based approach allows to have a cleaner implementation of both the airflux library and the final application stores.

As such, this project aims to be used only by React 0.13 ES6 style componenents and drops the support for mixins completely.


### Similarities with Flux

Some concepts are still in Airflux in comparison with Flux:

* There are actions
* There are data stores
* The data flow is unidirectional

### Differences with Flux

Airflux has refactored Flux to be a bit more dynamic and be more Functional Reactive Programming (FRP) friendly:

* The singleton dispatcher is removed in favor for letting every action act as dispatcher instead.
* Because actions are listenable, the stores may listen to them. Stores don't need to have big switch statements that do static type checking (of action types) with strings
* Stores may listen to other stores, i.e. it is possible to create stores that can *aggregate data further*, similar to a map/reduce.
* `waitFor()` is replaced in favor to handle *serial* and *parallel* data flows:
 * **Aggregate data stores** (mentioned above) may listen to other stores in *serial*
 * **Joins** for joining listeners in *parallel*
* *Action creators* are not needed because Airflux actions are functions that will pass on the payload they receive to anyone listening to them

[Back to top](#content)

## Examples

TODO

[Back to top](#content)

## Usage

For a full example check the [`test/index.js`](test/index.js) file.

[Back to top](#content)

### Creating actions

Create an action by creation an object from the class `airflux.Action`.

```javascript
var statusUpdateAction = new airflux.Action();
```

An action can then be transformed to a [functor](http://en.wikipedia.org/wiki/Function_object) that can be invoked like any function.

```javascript
var statusUpdate = statusUpdateAction.asFunction;
statusUpdate( data ); // Invokes the action statusUpdate
```

You can use `.asSyncFunction` to transform the action into a synchronous operation.


#### Asynchronous actions

For actions that represent asynchronous operations (e.g. API calls), a few separate dataflows result from the operation. In the most typical case, we consider completion and failure of the operation.
To create related actions for these dataflows, which you can then access as attributes, use `.withChildren`.

Children are created on the parent action as Action.
They're created on the functor of the parent action as functor themselves.


```javascript
// this creates 'load', 'load.completed' and 'load.failed'
var loadAction = new airflux.Action().withChilden( [ 'completed', 'failed'] );
console.log( loadAction.completed instanceof Action ); // true

var load = loadAction.asFunction;

// when 'load' is triggered, call async operation and trigger related actions
load.listen( () => {
    // By default, the listener is bound to the action
    // so we can access child actions using 'this'
    someAsyncOperation()
        .then( this.completed ) // here completed if the functor of the .completed action
        .catch( this.failed );
});
```

There is a shorthand to define the `completed` and `failed` actions in the typical case: `.asyncResult`. The following are equivalent:

```javascript
new airflux.Action().withChildren( [ 'progressed', 'completed', 'failed' ] );

new airflux.Action().asyncResult().withChilren( [ 'progressed ' ] );
```

There are a couple of helper methods available to trigger the `completed` and `failed` actions:

* `#promise(promise)` - Expects a promise object and binds the triggers of the `completed` and `failed` child actions to that promise, using `then()` and `catch()`.

* `#listen(callback)` - Expects a function which can return a promise object. If it does, `#promise()` is called with the returned promise object.

Therefore, the following are all equivalent:

```javascript
var asyncResultAction = new airflux.Action().asyncResult().asFunction;

asyncResultAction.listen( ( arguments ) =>
    someAsyncOperation( arguments )
        .then( asyncResultAction.completed )
        .catch( asyncResultAction.failed );
);

asyncResultAction.listen( ( arguments ) => asyncResultAction.promise( someAsyncOperation( arguments ) ) );

asyncResultAction.listen( someAsyncOperation );
```

`.asyncResult` can take the listen function as a parameter. Therefore, the declaration before can be simplified as:

```javascript
var asyncResultAction = new airflux.Action().asyncResult( someAsyncOperation );
```

#### Actions as functor

In order to be used easily, actions should be converted to a functor using either `asFunction` or `asSyncFunction`.
Every functor contains an attribute `.action` in order to get the original action object.
Action or Functor can be passed to `listenTo`, with the same result.


```javascript
var action = new airflux.Action().asFunction;

// trigger the action, using the default asynchronous functor
action();


var syncActionFn = new airflux.Action().asSyncFunction;

// trigger the action, synchronously
syncActionFn();


var actionObject = new airflux.Action();
var actionObjectFn = new airflux.Action().asFunction;

actionObjectFn.action === actionObject;

```


##### Asynchronous actions as Promises

Asynchronous actions can be used as promises, which is particularly useful for server-side rendering when you must await the successful (or failed) completion of an action before rendering.

Suppose you had an action + store to make an API request:

```javascript
// Create async action with `completed` & `failed` children
var makeRequest = new airflux.Action().asyncResult();

class RequestStore extends airflux.Store {
    constructor() {
        super();
        this.listenTo( makeRequest, this.onMakeRequest );
    }

    onMakeRequest( url ) {
        // Assume `request` is some HTTP library (e.g. superagent)
        request( url, (response) => {
            if( response.ok ) {
                makeRequest.completed( response.body );
            } else {
                makeRequest.failed( response.error );
            }
        })
    }
};
```

Then, on the server, you could use promises to make the request and either render or serve an error:

```javascript
makeRequest.triggerPromise('/api/something').then( ( body ) => {
    // Render the response body
}).catch( ( err ) => {
    // Handle the API error object
});
```

#### Action hooks

There are a couple of hooks available for each action.

* `preEmit()` - Is called before the action emits an event. It receives the arguments from the action invocation. If it returns something other than undefined, that will be used as arguments for `shouldEmit()` and subsequent emission.

* `shouldEmit()` - Is called after `preEmit()` and before the action emits an event. By default it returns `true` which will let the action emit the event. You may override this if you need to check the arguments that the action receives and see if it needs to emit the event.

Example usage:

```javascript
actions.statusUpdate.preEmit = () => { console.log( arguments ); };
actions.statusUpdate.shouldEmit = ( value ) => value > 0;

actions.statusUpdate( 0 );
actions.statusUpdate( 1 );
// Should output: 1
```

You can also set the hooks by sending them in a definition object as you create the action:

```javascript
var action = new airflux.Action();

action.preEmit = () => { /* ... */ };
action.shouldEmit = () => { /* ... */ };
```

[Back to top](#content)

### Creating data stores

Creating stores is done by extending the `airflux.Store` class.

```javascript
class StatusStore {
    constructor() {
        super();
        this.listenTo( statusUpdate, this.output );
    }

    output() {
        var status = flag ? 'ONLINE' : 'OFFLINE';
        this.trigger(status);
    }
}
```

In the above example, whenever the action is called, the store's `output()` callback will be called with whatever parameters was sent in the action. E.g. if the action is called as `statusUpdate(true)` then the `flag` argument in `output()` method call is `true`.

A data store is a publisher much like the actions, so they too have the `preEmit()` and `shouldEmit()` hooks.


#### Listening to many actions at once

Since it is a very common pattern to listen to all actions from a `airflux.createActions()` call in a store `init()` call, the store has a `listenToMany()` function that takes an object of listenables. Instead of doing this:

```javascript
var actions = {
    fireball    : new airflux.Action(),
    magicMissile: new airflux.Action()
};

class Store extends airflux.Store {
    constructor() {
        super();
        this.listenTo( actions.fireBall, this.onFireBall );
        this.listenTo( actions.magicMissile, this.onMagicMissile );
    }

    onFireBall() {
        // whoooosh!
    }

    onMagicMissile() {
        // bzzzzapp!
    }
}
```

...you can do this:

```javascript
class Store extends airflux.Store {
    constructor() {
        super();
        this.listenToMany( actions );
    }

    onFireBall() {
        // whoooosh!
    }

    onMagicMissile() {
        // bzzzzapp!
    }
}
```

This will add listeners to all actions `actionName` who have a corresponding `onActionName()` (or `actionName` if you prefer) method in the store. Thus if the `actions` object should also have included an `iceShard` spell, that would simply be ignored.


### Listening to Stores

Since stores can also be listened too, they can publish data.
Stores can have a getter `state`. The mehtod `publishState` always publishes the value of `state` to all listeners.
`FluxComponent` that listen to stores will receive this value. When using the shorthand setting the state of the component automatically, `FluxComponent` will set the initial state of the component to the current one of the store.

```javascript
class StatefulStore extends airflux.Store {
    get state() {
        return 'data';
    }

    storeAction() {
        this.publishState();
    }
}
```

### Listening to changes in data store

In your component, register to listen to changes in your data store like this:

```javascript
// Fairly simple view component that outputs to console
function ConsoleComponent() {
    // Registers a console logging callback to the statusStore updates
    statusStore.listen( ( status ) => console.log( 'status: ', status ) );
};

var consoleComponent = new ConsoleComponent();
```

Invoke actions as if they were functions:

```javascript
statusUpdate( true );
statusUpdate( false );
```

With the setup above this will output the following in the console:

```
status:  ONLINE
status:  OFFLINE
```

[Back to top](#content)


### React component example

Using airflux inside your React component can be done in three ways:
- manually or by doing a pimpl of Listener
- by extending FluxComponent

#### Manually

The React component needs to start listening on `componentDidMount` and stop listening on `componentWillUnmount`.

```javascript
class Status extends React.Component {
     onStatusChange(status) {
          this.setState({
               currentStatus: status
          });
     }
     componentDidMount() {
          this.unsubscribe = statusStore.listen(this.onStatusChange);
     }
     componentWillUnmount() {
          this.unsubscribe();
     }
     render() {
          // render specifics
     }
}
```

#### FluxComponent with callbacks

You always need to unsubscribe components from observed actions and stores upon unmounting. To simplify this process you can use FluxComponent, which will subscribe and unsubscribes automatically.

```javascript
class Status extends airflux.FluxComponent {
    constructor( props ) {
        super( props, { statusChanged: statusStore } );
    }

    statusChanged( status ) {
        this.setState({
            currentStatus: status
        });
    }

    render() {
        // render specifics
    }
});
```

#### Using FluxComponent with state

If all you want to do is update the state of your component to whatever the data store transmits, you can use `airflux.FluxComponent( props, { stateKey: listenable } )`

```javascript
class Status extends airflux.FluxComponent {
    constructor( props ) {
        super( props, { currentStatus, statusStore } );
    }

    render{
        // render using `this.state.currentStatus`
    }
};
```

### Listening to changes in other data stores (aggregate data stores)

A store may listen to another store's change, making it possible to safely chain stores for aggregated data without affecting other parts of the application. A store may listen to other stores using the same `listenTo()` function as with actions:

```javascript
// Creates a Store that listens to statusStore
class StatusHistoryStore extends airflux.Store {
    constructor() {
        super();

        // Register statusStore's changes
        this.listenTo( statusStore, this.output );
        this.history = [];
    }

    // Callback
    output( statusString ) {
        this.history.push({
            date: new Date(),
            status: statusString
        });

        // Pass the data on to listeners
        this.trigger(this.history);
    }
};
```

[Back to top](#content)

## Advanced usage

### Switching EventEmitter

Don't like to use the EventEmitter provided? You can switch to another one, such as node.js's own like this:

```javascript
// Do this before creating actions or stores
airflux.setEventEmitter(require('events').EventEmitter);
```

### Switching nextTick()

Whenever action functors are called (except via `Action#triggerSync()`), they return immediately through the use of `setTimeout()` (`nextTick()` function) internally.

You may switch out for your favorite `setTimeout()`, `nextTick()`, `setImmediate()`, et al implementation:

```javascript
// node.js env
airflux.nextTick(process.nextTick);
```

For better alternative to `setTimeout()`, you may opt to use the [`setImmediate()` polyfill](https://github.com/YuzuJS/setImmediate), [`setImmediate2`](https://github.com/Katochimoto/setImmediate) or [`macrotask`](https://github.com/calvinmetcalf/macrotask).


### Joining parallel listeners with composed listenables

The Airflux API contains `join*()` methods that makes it easy to aggregate publishers that emit events in parallel. This corresponds with the `waitFor()` mechanism in Flux.

#### Argument tracking

A join is triggered once all participating publishers have emitted at least once. The callback will be called with the data from the various emissions, in the same order as the publishers were listed when the join was created.

There are four join methods, each representing a different strategy to track the emission data:

*    `joinLeading()`: Only the first emission from each publisher is saved. Subsequent emissions by the same publisher before all others are finished are ignored.
*    `joinTrailing()`: If a publisher triggers twice, the second emission overwrites the first.
*    `joinConcat()`: An array of emission arguments are stored for each publisher.
*    `joinStrict()`: An error is thrown if a publisher emits twice before the join is completed.

The method signatures all look like this:

```javascript
join*(...publisher, callback)
```

Once a join is triggered, it will reset, and thus it can trigger again when all publishers have emitted anew.

#### Using the listener instance methods

All objects using the listener API (stores, React components using `ListenerMixin`, or other components using the `ListenerMethods`) gain access to the four join instance methods, named after the argument strategy. Here's an example saving the last emission from each publisher:

```javascript
class GainHeroBadgeStore extends airflux.Store {
    constructor() {
        this.joinTrailing(
            actions.disarmBomb,
            actions.saveHostage,
            actions.recoverData,
            this.trigger
        );
    }
}

var gainHeroBadgeStore = new GainHeroBadgeStore();

actions.disarmBomb('warehouse');
actions.recoverData('seedyletter');
actions.disarmBomb('docks');
actions.saveHostage('offices', 3);
// `gainHeroBadgeStore` will now asyncronously trigger `[[ 'docks' ], [ 'offices', 3 ], [ 'seedyletter' ]]`.
```

### Sending the store of the state

```javascript
class ExampleStore extends airflux.Store {
    get state() {
        return 'the initial data';
    }
};

// Anything that will listen to the example store
this.listenTo(exampleStore, onChangeCallback, initialCallback)

// initialCallback will be invoked immediately with 'the initial data' as the first argument
```

Remember the `listenToMany()` method? In case you use that with other stores, it supports `get state()`. That data is sent to the normal listening callback, or a `this.on<Listenablename>Default()` method if that exists.

[Back to top](#content)

## Colophon

[List of contributors](https://github.com/jankuca/airflux/graphs/contributors) is available on Github.

This project is licensed under [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause). Copyright (c) 2014, Mikael Brassman, Jan Kuča.

For more information about the license for this particular project [read the LICENSE.md file](LICENSE.md).

This project uses [eventemitter3](https://github.com/3rd-Eden/EventEmitter3), is currently MIT licensed and [has it's license information here](https://github.com/3rd-Eden/EventEmitter3/blob/master/LICENSE).

[npm-image]: http://img.shields.io/npm/v/airflux.svg
[npm-url]: http://www.npmjs.org/package/airflux
[downloads-image]: http://img.shields.io/npm/dm/airflux.svg
[bower-image]: http://img.shields.io/bower/v/airflux.svg
[bower-url]: http://bower.io/search/?q=airflux
[travis-image]: http://img.shields.io/travis/jankuca/airflux/master.svg
[travis-url]: https://travis-ci.org/jankuca/airflux
