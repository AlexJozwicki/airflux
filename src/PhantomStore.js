/* @flow */
import AsyncResultAction from './AsyncResultAction';
import Store from './Store';
import FluxComponent from './FluxComponent';
export { default as FluxComponent } from './FluxComponent';


/**
 * A nice way to avoid starting a Promise inside a React component, and writing a this.setState in the then..
 * which crashes if for any reason the component is unmounted.
 * Which happens often with Views, when the users goes somewhere else.
 *
 * @example
 *   this.connectStore( new PhantomStore( () => fetch( '/url' ), arg1, arg2 ), 'stateKey' );
 *
 */
export default class PhantomStore< T: Object > extends Store< T > {
    /**
     *
     * @param  {Function}   promiseFunctor      the function returning a Promise, to wrap
     * @param  {...}        args                arguments to be passed to the function, when called.
     */
    constructor( promiseFunctor: () => Promise< T >, ...args: Array< any > ) {
        super();
        const action = new AsyncResultAction( promiseFunctor ).asFunction;
        this.listenTo( action.completed, res => {
            this.state = res;
            this.publishState();
        });
        action( ...args );
    }
}
