(function(a,b){'object'==typeof exports&&'object'==typeof module?module.exports=b():'function'==typeof define&&define.amd?define('airflux',[],b):'object'==typeof exports?exports.airflux=b():a.airflux=b()})('undefined'==typeof self?this:self,function(){return function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={i:d,l:!1,exports:{}};return a[d].call(e.exports,e,e.exports,b),e.l=!0,e.exports}var c={};return b.m=a,b.c=c,b.d=function(a,c,d){b.o(a,c)||Object.defineProperty(a,c,{configurable:!1,enumerable:!0,get:d})},b.n=function(a){var c=a&&a.__esModule?function(){return a['default']}:function(){return a};return b.d(c,'a',c),c},b.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},b.p='',b(b.s=10)}([function(a,b,c){'use strict';function d(a){return a&&a.__esModule?a:{default:a}}function e(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}function f(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}Object.defineProperty(b,'__esModule',{value:!0});var g=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),h=c(2),i=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}(h),j=c(1),k=d(j),l=c(12),m=d(l),n=function(){function a(){f(this,a),this._emitter=new m.default}return g(a,[{key:'processResult',value:function(){}},{key:'listen',value:function(a){var b=this;(0,k.default)('function'==typeof a,'listen has to be given a valid callback function');var c=!1,d=function(d){c||b.processResult(a.apply(b,d))};return this._emitter.addListener(this.eventLabel,d),function(){c=!0,b._emitter.removeListener(b.eventLabel,d)}}},{key:'listenOnce',value:function(a){var b=this;(0,k.default)('function'==typeof a,'listenOnce has to be given a valid callback function');var c=this.listen(function(){for(var d=arguments.length,e=Array(d),f=0;f<d;f++)e[f]=arguments[f];return c(),a.apply(b,e)});return c}},{key:'triggerSync',value:function(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];this._emitter.emit(this.eventLabel,b)}},{key:'trigger',value:function(){for(var a=this,b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];setTimeout(function(){return a.triggerSync.apply(a,e(c))},0)}},{key:'eventLabel',get:function(){return'event'}}]),a}();b.default=n},function(a){a.exports=require('invariant')},function(a,b){'use strict';Object.defineProperty(b,'__esModule',{value:!0});var c='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a};b.isObject=function(a){var b='undefined'==typeof a?'undefined':c(a);return'function'===b||'object'===b&&!!a},b.isFunction=function(a){return'function'==typeof a},b.isArguments=function(a){return'object'===('undefined'==typeof a?'undefined':c(a))&&'callee'in a&&'number'==typeof a.length}},function(a,b,c){'use strict';function d(a){return a&&a.__esModule?a:{default:a}}function e(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function f(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function g(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var h=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),i=c(2),j=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}(i),k=c(1),l=d(k),m=c(0),n=d(m),o=c(14),p=d(o),q=function(a){function b(){var a,c,d,g;e(this,b);for(var h=arguments.length,i=Array(h),j=0;j<h;j++)i[j]=arguments[j];return g=(c=(d=f(this,(a=b.__proto__||Object.getPrototypeOf(b)).call.apply(a,[this].concat(i))),d),d._subscriptions=[],c),f(d,g)}return g(b,a),h(b,[{key:'hasListener',value:function(a){var c=this._subscriptions.reduce(function(a,b){return a.concat(b.listenable)},[]);return c.some(function(c){return c===a||c instanceof b&&c.hasListener(a)})}},{key:'validateListening',value:function(a){(0,l.default)(a!==this,'Listener is not able to listen to itself'),(0,l.default)('function'==typeof a.listen,'listenable should be a Publisher'),(0,l.default)(!(a instanceof b&&a.hasListener(this)),'Listener cannot listen to this listenable because of circular loop')}},{key:'listenTo',value:function(a,b){var c=this;this.validateListening(a),(0,l.default)(null!=b,'listenTo should be called with a valid callback');var d=a.listen(b.bind(this)),e=this.addSubscription(function(){var a=c._subscriptions.indexOf(e);(0,l.default)(0<=a,'Tried to remove listen already gone from subscriptions list!'),c._subscriptions.splice(a,1),d()},a);return e}},{key:'stopListeningTo',value:function(a){for(var b,c=this._subscriptions||[],d=0;d<c.length;++d)if(b=c[d],b.listenable===a)return b.stop(),(0,l.default)(-1===c.indexOf(b),'Failed to remove listen from subscriptions list!'),!0;return!1}},{key:'addSubscription',value:function(a,b){var c={stop:a,listenable:b};return this._subscriptions.push(c),c}},{key:'removeSubscription',value:function(a){var b=this._subscriptions.indexOf(a);0>b||this._subscriptions.splice(b,1)}},{key:'stopListeningToAll',value:function(){for(var a=this._subscriptions||[],b=0;b=a.length;)a[0].stop(),(0,l.default)(a.length===b-1,'Failed to remove listen from subscriptions list!')}},{key:'fetchInitialState',value:function(a,b){if(j.isFunction(b)&&!!a.state){var c=a instanceof n.default?a.state:null;b.call(this,c)}}},{key:'joinTrailing',value:function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return this._createJoin('last',a,c)}},{key:'joinLeading',value:function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return this._createJoin('first',a,c)}},{key:'joinConcat',value:function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return this._createJoin('all',a,c)}},{key:'joinStrict',value:function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return this._createJoin('strict',a,c)}},{key:'_createJoin',value:function(a,b,c){var d=this;(0,l.default)(2<=c.length,'Cannot create a join with less than 2 listenables!'),c.forEach(function(a){return d.validateListening(a)});var e=new p.default(c,a).listen(b),f={listenable:c,stop:function(a){function b(){return a.apply(this,arguments)}return b.toString=function(){return a.toString()},b}(function(){e(),d.removeSubscription(f)})};return this._subscriptions.push(f),f}}]),b}(n.default);b.default=q},function(a,b,c){'use strict';function d(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function e(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function f(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var g=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),h=c(0),i=function(a){return a&&a.__esModule?a:{default:a}}(h);var j=function(a){function b(){var a=0<arguments.length&&void 0!==arguments[0]&&arguments[0];d(this,b);var c=e(this,(b.__proto__||Object.getPrototypeOf(b)).call(this));return c.children={},c._sync=a,c}return f(b,a),g(b,[{key:'withChildren',value:function(a){var c=this;return a.forEach(function(a){if('string'==typeof a){var d=new b;c.children[a]=d,Object.defineProperty(c,a,{value:d})}else if(Array.isArray(a)&&'string'==typeof a[0]&&a[1]instanceof b){var e=a[0];c.children[e]=a[1],Object.defineProperty(c,e,{value:a[1]})}}),this}},{key:'filter',value:function(a){var c=new b;return this.listen(function(){a.apply(void 0,arguments)&&c.trigger.apply(c,arguments)}),c}},{key:'createFunctor',value:function(a){var c=this,d=a.bind(this);return Object.defineProperty(d,'_isActionFunctor',{value:!0}),Object.defineProperty(d,'action',{value:this}),Object.defineProperty(d,'listen',{value:function(a){return b.prototype.listen.call(c,a)}}),Object.defineProperty(d,'listenOnce',{value:function(a){return b.prototype.listenOnce.call(c,a)}}),Object.keys(this.children).forEach(function(a){Object.defineProperty(d,a,{value:c.children[a].asFunction})}),d}},{key:'asSyncFunction',get:function(){return this.createFunctor(this.triggerSync)}},{key:'asFunction',get:function(){return this.createFunctor(this._sync?this.triggerSync:this.trigger)}},{key:'exec',get:function(){return this.asFunction}},{key:'eventLabel',get:function(){return'event'}},{key:'isAction',get:function(){return!0}}]),b}(i.default);b.default=j},function(a,b,c){'use strict';function d(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}function e(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function f(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function g(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var h=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),i=c(4),j=function(a){return a&&a.__esModule?a:{default:a}}(i);var k=function(a){function b(a){var c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:!0;e(this,b);var d=f(this,(b.__proto__||Object.getPrototypeOf(b)).call(this,c));return d.children.completed=new j.default,d.children.failed=new j.default,Object.defineProperty(d,'completed',{value:d.children.completed}),Object.defineProperty(d,'failed',{value:d.children.failed}),'function'==typeof a&&d.listen(a),d}return g(b,a),h(b,[{key:'processResult',value:function(a){var b=this;a instanceof Promise&&a.then(function(){var a;return(a=b.completed).trigger.apply(a,arguments)}).catch(function(){var a;return(a=b.failed).asFunction.apply(a,arguments)})}},{key:'triggerPromise',value:function(){for(var a=this,b=arguments.length,c=Array(b),e=0;e<b;e++)c[e]=arguments[e];var f=new Promise(function(b,e){var f=a.completed.listen(function(a){f(),g(),b(a)}),g=a.failed.listen(function(a){f(),g(),e(a)});a.trigger.apply(a,d(c))});return f}},{key:'asFunction',get:function(){return this.createFunctor(this.triggerPromise)}}]),b}(j.default);b.default=k},function(a,b,c){'use strict';function d(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function e(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function f(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function g(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var h=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},i=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),j=function a(b,c,d){null===b&&(b=Function.prototype);var e=Object.getOwnPropertyDescriptor(b,c);if(e===void 0){var f=Object.getPrototypeOf(b);return null===f?void 0:a(f,c,d)}if('value'in e)return e.value;var g=e.get;return void 0===g?void 0:g.call(d)},k=c(3),l=function(a){return a&&a.__esModule?a:{default:a}}(k),m=function(a){function b(){return e(this,b),f(this,(b.__proto__||Object.getPrototypeOf(b)).call(this))}return g(b,a),i(b,[{key:'publishState',value:function(){j(b.prototype.__proto__||Object.getPrototypeOf(b.prototype),'trigger',this).call(this,this.state)}},{key:'connectStore',value:function(a,b){var c=this,e=2<arguments.length&&void 0!==arguments[2]&&arguments[2];this.state=this.state||{},this.state[b]=a.state,this.listenTo(a,function(a){return c.setState(d({},b,a))})}},{key:'setState',value:function(a,b){this.state='function'==typeof a?a(this.state):h({},this.state,a),this.publishState(),'function'==typeof b&&b()}},{key:'eventLabel',get:function(){return'change'}}]),b}(l.default);b.default=m},function(a,b,c){'use strict';function d(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function e(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}Object.defineProperty(b,'__esModule',{value:!0});var f=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),g=c(0),h=function(a){return a&&a.__esModule?a:{default:a}}(g),i=function(){function a(){var b=this,c=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};e(this,a),Object.keys(c).forEach(function(a){return b[a]=c[a]})}return f(a,[{key:'getPublishers',value:function(){var a=this;return Object.keys(this).filter(function(b){return'function'==typeof a[b].listen}).map(function(b){return d({},b,a[b])}).reduce(function(c,a){return Object.assign({},c,a)})}}]),a}();b.default=i},function(a){a.exports=require('react')},function(a){a.exports=require('prop-types')},function(a,b,c){a.exports=c(11)},function(a,b,c){'use strict';function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}function e(a){return a&&a.__esModule?a:{default:a}}Object.defineProperty(b,'__esModule',{value:!0}),b.Core=b.AirfluxApp=b.ConnectStore=b.Environment=b.Joins=b.Store=b.Publisher=b.Listener=b.PromiseAction=b.AsyncResultAction=b.Action=void 0;var f=c(4);Object.defineProperty(b,'Action',{enumerable:!0,get:function(){return e(f).default}});var g=c(5);Object.defineProperty(b,'AsyncResultAction',{enumerable:!0,get:function(){return e(g).default}});var h=c(13);Object.defineProperty(b,'PromiseAction',{enumerable:!0,get:function(){return e(h).default}});var i=c(3);Object.defineProperty(b,'Listener',{enumerable:!0,get:function(){return e(i).default}});var j=c(0);Object.defineProperty(b,'Publisher',{enumerable:!0,get:function(){return e(j).default}});var k=c(6);Object.defineProperty(b,'Store',{enumerable:!0,get:function(){return e(k).default}});var l=c(7);Object.defineProperty(b,'Environment',{enumerable:!0,get:function(){return e(l).default}});var m=c(15);Object.defineProperty(b,'ConnectStore',{enumerable:!0,get:function(){return e(m).default}});var n=c(16);Object.defineProperty(b,'AirfluxApp',{enumerable:!0,get:function(){return e(n).default}});var o=c(17),p=d(o),q=c(2),r=d(q);b.Joins=p,b.Core=r},function(a){a.exports=require('eventemitter3')},function(a,b,c){'use strict';function d(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function e(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function f(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var g=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),h=c(5),i=function(a){return a&&a.__esModule?a:{default:a}}(h),j=function(a){function b(a){return d(this,b),e(this,(b.__proto__||Object.getPrototypeOf(b)).call(this,a))}return f(b,a),g(b,[{key:'processResult',value:function(a){var b=this;a instanceof Promise&&a.then(function(){var a;return(a=b.completed).trigger.apply(a,arguments)}).catch(function(){var a;return(a=b.failed).asFunction.apply(a,arguments)})}},{key:'asFunction',get:function(){return this.createFunctor(this.triggerPromise)}}]),b}(i.default);b.default=j},function(a,b){'use strict';function c(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}Object.defineProperty(b,'__esModule',{value:!0});var d=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),e=Array.prototype.slice,f=function(){function a(b,d){c(this,a),this._args=[],this._listenablesEmitted=[],this._listenables=b,this._strategy=d,this._reset()}return d(a,[{key:'_reset',value:function(){this._listenablesEmitted=Array(this.count),this._args=Array(this.count)}},{key:'listen',value:function(a){var b=this,c=this._listenables.map(function(a,c){return a.listen(b._newListener(c).bind(b))});return this._callback=a,function(){return c.forEach(function(a){return a()})}}},{key:'_newListener',value:function(a){return function(){var b=e.call(arguments);if(this._listenablesEmitted[a])switch(this._strategy){case'strict':throw new Error('Strict join failed because listener triggered twice.');case'last':this._args[a]=b;break;case'all':this._args[a].push(b);}else this._listenablesEmitted[a]=!0,this._args[a]='all'===this._strategy?[b]:b;this._emitIfAllListenablesEmitted()}}},{key:'_emitIfAllListenablesEmitted',value:function(){for(var a=0;a<this.count;++a)if(!this._listenablesEmitted[a])return;this._callback.apply(null,this._args),this._reset()}},{key:'count',get:function(){return this._listenables.length}}]),a}();b.default=f},function(a,b,c){'use strict';function d(a){return a&&a.__esModule?a:{default:a}}function e(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function f(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function g(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function h(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var i=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),j=c(8),k=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}(j),l=c(9),m=d(l),n=c(1),o=d(n),p=c(3),q=d(p),r=c(7),s=d(r),t=function(a){function b(a,c){f(this,b);var d=g(this,(b.__proto__||Object.getPrototypeOf(b)).call(this,a));d._listener=new q.default;var h=d._getEnvironment(a,c).getPublishers();return 0<Object.keys(h).length&&(d.state=Object.keys(h).map(function(a){return e({},a,h[a].state)}).reduce(function(c,a){return Object.assign({},c,a)})),d}return h(b,a),i(b,[{key:'_getEnvironment',value:function(a,b){var c=a||this.props,d=b||this.context;return d&&d.airflux?d.airflux.environment:c&&c.environment?c.environment:new s.default(c.stores)}},{key:'getPublishers',value:function(){return this._getEnvironment().getPublishers()}},{key:'componentDidMount',value:function(){var a=this,b=this._getEnvironment().getPublishers();Object.keys(b).forEach(function(c){return a._listenToStore(b[c],c)})}},{key:'_listenToStore',value:function(a,b){var c=this;this._listener.listenTo(a,function(a){return c.setState(e({},b,a))})}},{key:'render',value:function(){var a=this.props.query||function(b){return b};return this.props.render(a(this.state))}}]),b}(k.Component);t.contextTypes={airflux:m.default.object},b.default=t},function(a,b,c){'use strict';function d(a){return a&&a.__esModule?a:{default:a}}function e(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function f(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function g(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}Object.defineProperty(b,'__esModule',{value:!0});var h=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),i=c(8),j=function(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b.default=a,b}(i),k=c(9),l=d(k),m=c(1),n=d(m),o=function(a){function b(){return e(this,b),f(this,(b.__proto__||Object.getPrototypeOf(b)).apply(this,arguments))}return g(b,a),h(b,[{key:'getChildContext',value:function(){return{airflux:{environment:this.props.environment}}}},{key:'render',value:function(){return this.props.children}}]),b}(j.Component);o.childContextTypes={airflux:l.default.object},b.default=o},function(a,b,c){'use strict';function d(a){for(var b=new f.default,c=arguments.length,d=Array(1<c?c-1:0),e=1;e<c;e++)d[e-1]=arguments[e];return b[a].apply(b,[b.trigger.bind(b)].concat(d)),b}Object.defineProperty(b,'__esModule',{value:!0}),b.joinStrict=function(){return d.apply(void 0,['joinStrict'].concat(Array.prototype.slice.call(arguments)))},b.joinLeading=function(){return d.apply(void 0,['joinLeading'].concat(Array.prototype.slice.call(arguments)))},b.all=function(){return d.apply(void 0,['joinTrailing'].concat(Array.prototype.slice.call(arguments)))},b.joinTrailing=function(){return d.apply(void 0,['joinTrailing'].concat(Array.prototype.slice.call(arguments)))},b.joinConcat=function(){return d.apply(void 0,['joinConcat'].concat(Array.prototype.slice.call(arguments)))};var e=c(6),f=function(a){return a&&a.__esModule?a:{default:a}}(e)}])});
//# sourceMappingURL=index.js.map