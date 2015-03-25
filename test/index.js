var airflux = require('../src');

// Creating an Action
var textUpdate = airflux.createAction();
var statusUpdate = airflux.createAction();

// Creating a Data Store - Listening to textUpdate action
var textStore = new class extends airflux.Store {
    constructor() {
        super();
        this.listenTo(textUpdate, this.output);
    }
    output() {
        var i, args = Array.prototype.slice.call(arguments, 0);
        for (i = 0; i < args.length; i++) {
            this.writeOut(args[i]);
        }
    }
    writeOut(text) {
        this.triggerSync(text);
    }
}();

// Creating a DataStore
var statusStore = new class extends airflux.Store {
    constructor() {
        super();
        this.listenTo(statusUpdate, this.output);
    }
    output(flag) {
        var status = flag ? 'ONLINE' : 'OFFLINE';
        this.triggerSync(status);
    }
}();

// Creating an aggregate DataStore that is listening to textStore and statusStore
var storyStore = new class extends airflux.Store {
    constructor() {
        super();
        this.listenTo(statusStore, this.statusChanged);
        this.listenTo(textStore, this.textUpdated);
        this.storyArr = [];
    }
    statusChanged(flag) {
        if (flag === 'OFFLINE') {
            this.triggerSync('Once upon a time the user did the following: ' + this.storyArr.join(', '));
            // empty storyArr
            this.storyArr.splice(0, this.storyArr.length);
        }
    }
    textUpdated(text) {
        this.storyArr.push(text);
    }
}();

// Fairly simple view component that outputs to console
function ConsoleComponent() {
    textStore.listen(function(text) {
        console.log('text: ', text);
    });
    statusStore.listen(function(status) {
        console.log('status: ', status);
    });
    storyStore.listen(function(story) {
        console.log('story: ', story);
    });
}

new ConsoleComponent();

// Invoking the action with arbitrary parameters
statusUpdate(true);
textUpdate("testing", 1337, { "test": 1337 });
statusUpdate(false);

/** Will output the following:
 *
 * status:  ONLINE
 * text:  testing
 * text:  1337
 * text:  { test: 1337 }
 * story:  Once upon a time the user did the following: testing, 1337, [object Object]
 * status:  OFFLINE
 */
