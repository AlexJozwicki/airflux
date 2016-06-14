# 0.6.0

In order to be Flow compliant, the previous Action class was split into:
- Action
- AsyncResultAction
- PhantomStore

Also, please note that from now, when importing `airflux`, you will by default import the ES6 version.
You will therefore have to configure your webpack/babel in order to babelify airflux as well.
Alternatively, you can import the ES5 version with :

```javascript
import * as airflux from 'airflux/es5';
```


## AsyncResultAction

AsyncResultAction is now a specific type of Action, which has a AsyncResult, and therefore has a `completed` and `failed` functors.
This replaces the modifier `asyncResult()` we previously had after creating the action.

## PromiseAction

PromiseAction is a specific case of AsyncResultAction, which takes a functor returning a Promise. The promise will be mapped directly onto the `completed` and
`failed` functors.
This replaces the previous argument of `asyncResult( () => promise )`.

## PhantomStore

To avoid processing promises inside a React component, and possibly having errors if the promise is resolved after the component is unmounted, we have now
a helper for a `PhantomStore`.
This type of store is not shared between components, but is specific to each instance of a component, proxying the promise resolution.

```javascript
@FluxComponent
class MyComponent extends React.Component {
    constructor( props ) {
        super( props );
        this.connectStore( new PhantomStore( () => fetch( '/url' ), arg1, arg2 ), 'stateKey' );
    }
}
```

## Migration guide

```javascript

// 0.5
const action        = new Action();
const asyncAction   = new Action().asyncResult();
const promiseAction = new Action().asyncResult( () => fetch( '/url' ) );

// 0.6
const action        = new Action();
const asyncAction   = new AsyncResultAction();
const promiseAction = new PromiseAction( () => fetch( '/url' ) );

```

# 0.5.0

Big revamp to support more ES6 syntax, Flow.

## New features

Airflux should now be soon Flux compatible.

### Action.asFunction for asynchronous actions

If your action has a completed and failed children, asFunction will now automatically return a Promise, bound to these children.
Meaning you can actually do:

```javascript
const action = new Action().asyncResult( () => new Promise( .... ) ).asFunction;
action().then( () => console.log( 'will be called when your promise is resolved' ) );
```


## Breaking changes

### Callback should always be functions

Up until now, the callbacks passed to listenTo could have been either functions or strings.
Strings were always resolved to functions, using the object; and it could have a context of execution, that would have been applied to it.
I think it's better if the user of the library does the actual resolution of names.
ES7 syntax `::` also greatly simplifies binding whatever callbacks to an instance, should you need it.

### ES6 Import

Use ES6 import syntax with airflux:

```javascript
import * as airflux from 'airflux';
```

or

```javascript
import { Action, Store, FluxComponent } from 'airflux';
```


### FluxComponent

FluxComponent is now a ES7 decorator.
It augments the Component with a listenTo function.
This allows components to retain the exact same syntax as Store when it comes to definition.
It also allows more use of class hierarchy. Before, if any class of you hierarchy needed to be connected to Flux, the root had
to inherit from FluxComponent.
You can now apply the decorator at any level.


```javascript
import React, { Component } from 'react';
import { Action, FluxComponent } from 'airflux';

const action = new Action().asFunction;

@FluxComponent
class YourComponent extends React.Component {
    constructor( props ) {
        super( props );
        this.listenTo( action, this.actionHandler );
        this.listenTo( oneStore, this.storeCallback );         // storeCallback will be called each time the state of the store changes
        this.connectStore( anotherStore, 'stateKey' );         // this.state.stateKey will be always in sync with store.state
    }

    actionHandler() {

    }

    storeCallback( storeState ) {

    }
}
```

The key difference here with simple mixins, is that FluxComponent actually modifies the prototype of YourComponent, and not each instance.
It also preserves any method already declared in your class, such as componentDidMount for instance.


### SyncAction

There is now a separate class for SyncAction.
I feel like they are not the norm, and are special enough to warrant the new instanciation of an action to be clear.

```javascript
import { SyncAction } from 'airflux';
const asyncAction = new SyncAction().asFunction;
```

### Joins arguments

The arguments order of all joins has been switched to joinx( callback, ...actions ).
The callback is now the first argument, instead of the last.
Actions should really have been considered as varargs, as they are right now with the ES6 syntax.
As a var arg, it should be the last.

### Joins stores

Are now exported under airflux.Joins


# 0.2.2

Child action are now created as Action and not functor on the parent action.
Child actions are added as functors on the functor of the parent action.

```
var action/*:Action*/ = new Action().asyncResult( fetch( 'url' ) );
console.log( action.completed instanceof Action ); // true
console.log( action.failed instanceof Action ); // true

var functor = action.asFunction;
console.log( typeof functor.completed ); // function
```

Child actions can now be created by passing a fully created action, and not only its name:
```
var action/*:Action*/ = new Action().withChildren( [ 'foo', [ 'bar', new Action( true ) ] ] );
```



# 0.2.1

Dropping the in-library support for Promise polyfill.
Basically the philosphy is that the default working environment should be a browser with everything.
Polyfill should only be added to the application if you need to support old browsers.
This should be done conditionnaly and by the user, before loading any libraries.

For this particular instance, you should include this line before loading airflux.

```
require('es6-promise').polyfill();
```

# 0.2.0

new Action doesn't return a functor anymore, but the class itself.
This was done in order to be able to easily extend it and create actions specific for your application.
Every options of an action is now explicit:
- .asyncResult to transform the action into one with a async result (completed and child actions)
- .withChildren to define children actions
- .asFunction to get a asynchronous functor
- .asSyncFunction to get a synchronous functor

Example:

```
var action/*:Action*/ = new Action().asyncResult( fetch( 'url' ) );
export action.asFunction as myAction;

var customAction = new Action();
customAction.listen( /** listen function );
```

A `SimpleAction` class is also provided to create very simple actions, and returns as before directly the functor.
