/* @flow */
import { Action, Store, FluxComponent } from 'airflux';
export { FluxComponent };


/**
 * A nice way to avoid starting a Promise inside a React component, and writing a this.setState in the then..
 * which crashes if for any reason the component is unmounted.
 * Which happens often with Views, when the users goes somewhere else.
 *
 * @example
 *   this.connectStore( new PhantomStore( () => fetch( '/url' ), arg1, arg2 ), 'stateKey' );
 *
 */
export default class PhantomStore extends Store< T > {
    state: T = null;

    /**
     *
     * @param  {Function}   promiseFunctor      the function returning a Promise, to wrap
     * @param  {...}        args                arguments to be passed to the function, when called.
     */
    constructor( promiseFunctor: () => Promise, ...args ) {
        super();
        const action = new Action().asyncResult( promiseFunctor ).asFunction;
        this.listenTo( action.completed, res => {
            this.state = res;
            this.publishState();
        });
        action( ...args );
    }
}
