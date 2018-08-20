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

## Installation

```
npm install airflux
```

[Back to top](#content)


## Creating an action

```javascript
import * as airflux                                     from 'airflux';

const action = new airflux.Action();

// action is an instance of a class by default. you can trigger it using function `triger`.
action.trigger();

// or create it as a function directly.
const changeMessage: ( message: string ) => any = new airflux.Action().asFunction;
changeMessage( 'hello world' );
```

## Creating a store

The store is your data warehouse. Similar to actions, we’ll be creating a class for the store. A store holds only a state, and the syntax to change its state is the same as a React Component.


```javascript
import * as airflux                                     from 'airflux';

export type TestStoreState = { message: string };

class TestStoreState extends airflux.Store< TestStoreState > {
    state = { message: 'Default state message' };

    constructor() {
        super();
    }
}
```

You can then connect a store to an action. Actions in Flux are the way to propagate a mutation to all stores.


```javascript
import * as airflux                                     from 'airflux';

export type TestStoreState = { message: string };

class TestStore extends airflux.Store< TestStoreState > {
    state = { message: 'Default state message' };

    constructor() {
        super();
        this.listenTo( changeMessage, ( message ) => this.setState( { message } ) );
    }
}
```

In this example, once the action `changeMessage` is called, it will change the state of TestStore.

## Connecting your component

Connecting your component to a store should be made using dedicated component ConnectStore.


```javascript
import * as airflux                                     from 'airflux';

const stores = {
    testStore: new TestStore()
};


class App extends React.Component {
    render() {
        return (
            <airflux.ConnectStore stores={ stores } render={ ( { testStore } ) => <h1>{ testStore.message }</h1> }/>
        )
    }
}
```

## Creating an environment

Stores can be injected throughout the whole app using the environment concept. Using this principle, the application can initialize all stores in one environment. ConnectStore will automatically use this environment, anywhere in your application.


```javascript
import * as airflux                                     from 'airflux';

const environment = new airflux.Environment( {
    testStore: new TestStore()
} );



class App extends React.Component {
    render() {
        return (
            <airflux.AirfluxApp environment={ environment }>
                <airflux.ConnectStore render={ ( { testStore } ) => <h1>{ testStore.message }</h1> }/>
            </airflux.AirfluxApp>
        )
    }
}
```


## Full Example

```javascript
import * as airflux                                     from 'airflux';


const search = new airflux.Action().asFunction;

// loadElements will have the same signature as the function passed to AsyncResultAction.
// Flow will render an error otherwise
const loadResults = new airflux.AsyncResultAction(
    ( search: string, max: number ) => fetch( `/results/search/${search}/${max}` ).then( r => r.json() )
).asFunction;

/**
 * A store that will hold the current search being done by the user.
 */
class SearchStore extends airflux.Store {
    state: { search: string } = { search: '' };

    constructor() {
        super();
        this.listenTo( search, search => this.setState( { search } ) );
    }
}

const searchStore = new SearchStore();


class ResultsStore extends airflux.Store {
    state: { results: Result[], resultsFiltered: Result[] } = {
        results         : [],
        resultsFiltered : []
    };

    constructor() {
        super();
        this.listenTo( search, search => loadResults( search, 50 ) );
        this.listenTo( loadResults.completed, this.resultsLoaded );
    }

    resultsLoaded( results: Result[] ) {
        const resultsFiltered = results.filter( r => r.matchesCritiria( this.state.searchStore.search ) );
        this.setState( { results, resultsFiltered } );
    }
}

const resultsStore = new resultsStore();


class Results extends React.Component< { results: { results: Result[], resultsFiltered: Result[] }, searchStore: any } > {
    get resultsFiltered() : Result[] { return this.props.results.resultsFiltered; }

    componentWillMount() {
        search( 'a search' );
    }

    render() {
        return (
            <div>
                <input type="text" value={ this.props.searchStore.search } onChange={ search } />
                The search is : { this.props.searchStore.search }
                { this.resultsFiltered.map( r => <ResultLine result={ r } /> ) }
            </div>
        );
    }
}

const ResultsContainer = ( props ) => <airflux.ConnectStore stores={ { resultsStores } } render={ ( { resultsStores, searchStore } ) => <Results {...props} results={ resultsStores } searchStore={ searchStore } /> } />;
```


## Actions

There are two main categories of action:
- Action
- AsyncResultAction

Action are asynchronous actions dispatched inside your application: they have no result type, and the caller cannot know whether the action has been processed.

AsyncResultAction are actions that wrap a function returning a Promise.
The return of the Promise will be piped to two children actions:
- completed
- failed


### Creating Action

Create an action by creation an object from the class `airflux.Action`.

```javascript
const statusUpdateAction = new airflux.Action();
```

An action can then be transformed to a [functor](http://en.wikipedia.org/wiki/Function_object) that can be invoked like any function.

```javascript
const statusUpdate: ( data: Object ) => void = statusUpdateAction.asFunction;
statusUpdate( data ); // Invokes the action statusUpdate
```

You can choose to either create directly the action as a functor, or use `.exec` to execute the action directly.
At this moment, functor are not completely typed with Flow. Therefore you will probably receive an error when attempting to access `.completed` on a functor for instance.


#### Asynchronous actions

For actions that represent asynchronous operations (e.g. API calls), a few separate dataflows result from the operation. In the most typical case, we consider completion and failure of the operation.
To create related actions for these dataflows, which you can then access as attributes, use `.withChildren`.

Children are created on the parent action as Action.
They're created on the functor of the parent action as functor themselves.


```javascript
var loadAction = new airflux.AsyncResultAction();

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

asyncResultAction.listen( someAsyncOperation );
```

`.asyncResult` can take the listen function as a parameter. Therefore, the declaration before can be simplified as:

```javascript
const asyncResultAction = new airflux.AsyncResultAction( someAsyncOperation );
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
const makeRequest = new airflux.AsyncResultAction();

class RequestStore extends airflux.Store {
    constructor() {
        super();
        this.listenTo( makeRequest, this.onMakeRequest );
    }

    onMakeRequest( url ) {
        fetch( url ).then( response => {
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



## Stores

### Creating stores

Creating stores is done by extending the `airflux.Store` class.
Stores are a lot similar to the React.Component:
- they have a state, which you should always declare with a type
- have a setState method to publish the state


```javascript
class StatusStore extends airflux.Store {
    state: { ready: boolean } = {
        ready: false
    };

    constructor() {
        super();
        this.listenTo( statusUpdate, ready => this.setState( { ready }) );
    }
}
```

In the above example, whenever the action is called, the state is updated with the new status, which was passed as an argument to `statusUpdate`.



### Listening to Stores

Since stores can also be listened too, they can publish data.
The method `setState` always publishes the value of `state` to all listeners, after having updated the state with the partial data passed.


```javascript
const changeMessage = new Action().asFunction;

class MessageStore extends airflux.Store {
    state: { message: string } = {
        message: '';
    }

    constructor() {
        super();
        this.listenTo( changeMessage, this.setState( { message } ) );
    }

    anAction() {
        this.setState( { message: 'Hello world!' } );
    }
}


// this will change the `message` in the Store state and broadcast it to everyone.
changeMessage( 'Hello World!' );
```



## Using it with React

Using airflux inside your React component can be done in three ways:
- by using the FluxComponent annotation
- using Capacitor component
- manually



### FluxComponent with callbacks

The `FluxComponent` annotation allows you to transform any of your component, regardless of its superclass, to a component listening to actions or stores.
The annotation was created in order for you to be able to transform one class to a Flux one, even if its superclass never needs Flux.

`FluxComponent` will add the following method to the class prototype:
- connectStore( store: Store, stateKey: string )
- listenTo( publisher: Action | Store, handler: Function )


```javascript
const theMessageStore = new MessageStore();

@airflux.FluxComponent
class Status extends React.Component {
    connectStore: ( store: Store< * >, stateKey: string, initialState?: boolean = false ) => void;
    listenTo: ( publisher: Store< * > | Action< * >, callback: Function ) => void;

    state: {
        ready       : boolean;
        messageStore: $PropertyType< MessageStore, 'state' >;
    };

    constructor( props: *, context: * ) {
        super( props, context );

        this.listenTo( updateStatus, status => this.setState( { status } ) );
        this.connectStore( theMessageStore, 'messageStore' );
    }

    render() {
        // render specifics
        return (
            <div>
                The status is { this.state.ready } to scream { this.state.messageStore.message }
            </div>
        );
    }
});
```


`connectStore` will automatically set the state of your component with the state of the Store.
By default, this is done in `componentWillMount`, which will be then available for the first rendering.
This is done as to be bulletproof as to where you will set your initial state: after or before `connectStore`.
You can pass a third argument `initialState` to `true` if you wish to have right after `connectStore`.

This default comportment might change in the future to true, if more people are setting the state directly on the property declaration, instead of in the constructor.

`listenTo` will need a handler to work. As usual, this works on both actions and stores.


In order to be Flow compliant, you need to include the declaration of the two functions that will be added by FluxComponent.
This is a point that will probably be changed in the future once we find a better alternative.


### Manually

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


### Listening to changes in other stores

A store may listen to another store's change, making it possible to safely chain stores for aggregated data without affecting other parts of the application. A store may listen to other stores using the same `listenTo()` function as with actions:

```javascript
class StatusHistoryStore extends airflux.Store {
    state: { statusStore: StatusStoreState };

    constructor() {
        super();
        this.connectStore( statusStore, 'statusStore' );
    }
}
```



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
airflux.join*(...publisher, callback)
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



### Differences with Flux

Airflux has refactored Flux to be a bit more dynamic and be more Functional Reactive Programming (FRP) friendly:

* The singleton dispatcher is removed in favor for letting every action act as dispatcher instead.
* Because actions are listenable, the stores may listen to them. Stores don't need to have big switch statements that do static type checking (of action types) with strings
* Stores may listen to other stores, i.e. it is possible to create stores that can *aggregate data further*, similar to a map/reduce.
* `waitFor()` is replaced in favor to handle *serial* and *parallel* data flows:
 * **Aggregate data stores** (mentioned above) may listen to other stores in *serial*
 * **Joins** for joining listeners in *parallel*
* *Action creators* are not needed because Airflux actions are functions that will pass on the payload they receive to anyone listening to them
