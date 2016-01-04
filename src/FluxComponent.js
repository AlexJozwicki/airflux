/* @flow */
import Listener from './Listener';
import type Publisher from './Publisher';


type ListenToDefinition = {
    listenable  : Publisher;
    callback    : Function | string;
};


export default function FluxComponent( target ) {
    var clazz = target.prototype;

    // pending listenables to be activated upon mounting
    var listens : Array< ListenToDefinition > = [];

    const orgComponentDidMount = clazz.componentDidMount;
    clazz.componentDidMount = function() {
        if( !!orgComponentDidMount ) orgComponentDidMount.call( this );
        this.__listener = this.__listener || new Listener();
        listens.forEach( ( pl ) => this.__mountListener( pl.listenable, pl.callback ) );
    };

    const orgComponentWillMount = clazz.componentWillMount;
    clazz.componentWillMount = function() {
        listens.forEach( ( pl ) => this.__initState( pl.listenable, pl.callback ) );
        if( !!orgComponentWillMount ) orgComponentWillMount.call( this );
    };

    const orgComponentWillUnmount = clazz.componentWillUnmount;
    clazz.componentWillUnmount = function() {
        if( !!this.__listener ) this.__listener.stopListeningToAll();
        if( !!orgComponentWillUnmount ) orgComponentWillUnmount.call( this );
    };

    clazz.__initState = function( listenable: Publisher, callback: Function | string ) {
        if( typeof callback === 'string' && !!listenable.state ) {
            this.state = this.state || {};
            this.state[ callback ] = listenable.state;
        }
    }

    clazz.__mountListener = function( listenable: Publisher, callback: Function | string ) {
        const $this = this;

        if( typeof callback === 'function' ) {
            this.__listener.listenTo( listenable, function() {
                // $FlowDynamicTypeCheckBug
                callback.apply( $this, arguments );
            } );
        }
        else if( typeof callback === 'string' && !!listenable.state ) {
            // $FlowDynamicTypeCheckBug
            this.__listener.listenTo( listenable, ( value ) => this.setState( { [callback]: value } ) );
        }
    }

    clazz.listenTo = function( listenable: Publisher, callback: Function | string ) {
        listens.push( { listenable, callback } );
    };
}
