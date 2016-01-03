/* @flow */
import Listener from './Listener';
import type Publisher from './Publisher';


type ListenToDefinition = {
    listenable  : Publisher;
    callback    : Function | string;
};


export default function FluxComponent( target ) {
    var clazz = target.prototype;
    var listener = new Listener();

    // pending listenables to be activated upon mounting
    var mountedListenables : Array< ListenToDefinition > = [];

    const orgComponentDidMount = clazz.componentDidMount;
    clazz.componentDidMount = function() {
        if( !!orgComponentDidMount ) orgComponentDidMount.call( this );

        mountedListenables.forEach( ( pl ) => listener.listenTo( pl.listenable, pl.callback ) );
    };

    const orgComponentWillMount = clazz.componentWillMount;
    clazz.componentWillMount = function() {
        if( !!orgComponentWillMount ) orgComponentWillMount.call( this );
    };

    const orgComponentWillUnmount = clazz.componentWillUnmount;
    clazz.componentWillUnmount = function() {
        listener.stopListeningToAll();
        if( !!orgComponentWillUnmount ) orgComponentWillUnmount.call( this );
    };

    clazz.listenTo = function( listenable: Publisher, callback: Function | string, afterMounting: boolean = true ) {
        if( afterMounting ) {
            mountedListenables.push( { listenable, callback } );
        }
        else {
            if( typeof callback === 'function' ) {
                listener.listenTo( listenable, function() {
                    // $FlowDynamicTypeCheckBug
                    callback.apply( this, arguments );
                } );
            }
            else if( typeof callback === 'string' && !!listenable.state ) {
                this.state = this.state || {};
                this.state[ callback ] = listenable.state;

                // $FlowDynamicTypeCheckBug
                listener.listenTo( listenable, ( value ) => this.setState( { [callback]: value } ) );
            }
        }
    };
}
