/* @flow */
import Listener         from './Listener';
import type Publisher   from './Publisher';
import type Store       from './Store';


type ListenToPublisher = {
    publisher   : Publisher;
    callback    : Function;
};

type ListenToStore = {
    store       : Store;
    stateKey    : string;
};


export default function FluxComponent( target: Function ) {
    var clazz = target.prototype;

    /**
     * Wrap the componentDidMount with our own.
     * We will start listening to every action once the component is mounted.
     */
    const orgComponentDidMount = clazz.componentDidMount;
    clazz.componentDidMount = function() {
        if( !!orgComponentDidMount ) orgComponentDidMount.call( this );

        this.__listener = this.__listener || new Listener();
        this.__publishers.forEach( ( pub ) => this.__listenToPublisher( pub.publisher, pub.callback ) );
        this.__stores.forEach( ( st ) => this.__listenToStore( st.store, st.stateKey ) );
    };

    /**
     * Wrap the componentWillMount with our own.
     * For store connections, we set the value of the state before the first render.
     * After that, it will be done through setState
     */
    const orgComponentWillMount = clazz.componentWillMount;
    clazz.componentWillMount = function() {
        this.state = this.state || {};
        this.__publishers = this.__publishers || [];
        this.__stores = this.__stores || [];

        this.__stores.forEach( ( st ) => this.state[ st.stateKey ] = st.store.state );
        if( !!orgComponentWillMount ) orgComponentWillMount.call( this );
    };

    /**
     * Wrap the componentWillMount with our own.
     * Stops listening to every subscriptions.
     */
    const orgComponentWillUnmount = clazz.componentWillUnmount;
    clazz.componentWillUnmount = function() {
        if( !!this.__listener ) this.__listener.stopListeningToAll();
        if( !!orgComponentWillUnmount ) orgComponentWillUnmount.call( this );
    };

    /**
     * Starts listening to a store.
     * The state of the store will be connected to the state of the componentWillUnmount
     * @param  {Store} store
     * @param  {string} stateKey
     */
    clazz.__listenToStore = function( store: Store, stateKey: string ) {
        this.__listener.listenTo( store, ( value ) => this.setState( { [stateKey]: value } ) );
    }

    clazz.__listenToPublisher = function( publisher: Publisher, callback: Function ) {
        const $this = this;

        this.__listener.listenTo( publisher, function() {
            callback.apply( $this, arguments );
        } );
    }

    /**
     * Connects the component to a store.
     *
     * @param  {Store} store        the store to listen to
     * @param  {string} stateKey    the key in the state of the component where the state of the store will be put
     */
    clazz.connectStore = function( store: Store, stateKey: string ) {
        this.__stores = this.__stores || [];
        this.__stores.push( { store, stateKey } );
    };

    /**
     * Listens to an action or store, and calls a callback everytime.
     * @param  {Publiser} publisher
     * @param  {Function} callback
     */
    clazz.listenTo = function( publisher: Publisher, callback: Function ) {
        this.__publishers = this.__publishers || [];
        this.__publishers.push( { publisher, callback } );
    };
}
