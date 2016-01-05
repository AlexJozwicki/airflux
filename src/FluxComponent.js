/* @flow */
import Listener from './Listener';
import type Publisher from './Publisher';


type ListenToPublisher = {
    publisher   : Publisher;
    callback    : Function;
};

type ListenToStore = {
    store       : Store;
    stateKey    : string;
};


export default function FluxComponent( target ) {
    var clazz = target.prototype;

    // pending listenables to be activated upon mounting
    var publishers  : Array< ListenToPublisher > = [];
    var stores      : Array< ListenToStore > = [];

    const orgComponentDidMount = clazz.componentDidMount;
    clazz.componentDidMount = function() {
        if( !!orgComponentDidMount ) orgComponentDidMount.call( this );
        this.__listener = this.__listener || new Listener();
        publishers.forEach( ( pub ) => this.__listenToPublisher( pub.publisher, pub.callback ) );
        stores.forEach( ( st ) => this.__listenToStore( st.store, st.stateKey ) );
    };

    const orgComponentWillMount = clazz.componentWillMount;
    clazz.componentWillMount = function() {
        stores.forEach( ( st ) => this.__initState( st.store, st.stateKey ) );
        if( !!orgComponentWillMount ) orgComponentWillMount.call( this );
    };

    const orgComponentWillUnmount = clazz.componentWillUnmount;
    clazz.componentWillUnmount = function() {
        if( !!this.__listener ) this.__listener.stopListeningToAll();
        if( !!orgComponentWillUnmount ) orgComponentWillUnmount.call( this );
    };

    clazz.__initState = function( store: Store, stateKey: string ) {
        this.state = this.state || {};
        this.state[ stateKey ] = store.state;
    }

    clazz.__listenToStore = function( store: Store, stateKey: string ) {
        // $FlowDynamicTypeCheckBug
        this.__listener.listenTo( store, ( value ) => this.setState( { [stateKey]: value } ) );
    }

    clazz.__listenToPublisher = function( publisher: Publisher, callback: Function ) {
        const $this = this;

        this.__listener.listenTo( publisher, function() {
            // $FlowDynamicTypeCheckBug
            callback.apply( $this, arguments );
        } );
    }

    clazz.connectStore = function( store: Store, stateKey: string ) {
        stores.push( { store, stateKey } );
    };

    clazz.listenTo = function( publisher: Publisher, callback: Function ) {
        publishers.push( { publisher, callback } );
    };
}
