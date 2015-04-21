## 0.2.1

Dropping the in-library support for Promise polyfill.
Basically the philosphy is that the default working environment should be a browser with everything.
Polyfill should only be added to the application if you need to support old browsers.
This should be done conditionnaly and by the user, before loading any libraries.

For this particular instance, you should include this line before loading airflux.

```
require('es6-promise').polyfill();
```

## 0.2.0

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
