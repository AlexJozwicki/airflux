import type { Listenable } from './Listenable';

type ListenToDefinition = {
    listenable  : Listenable;
    callback    : Function | string;
};


export function( target: ReactComponent ) {
    var clazz = target.prototype;
    var listener = new Listener();

    // pending listenables to be activated upon mounting
    var mountedListenables : Array< ListenToDefinition > = [];

    const orgComponentDidMount = target.componentDidMount;
    clazz.componentDidMount = function() {
        if( !!orgComponentDidMount ) orgComponentDidMount.call( this );

        pendingListenables.forEach( ( pl ) => this.listenTo( pl.listenable, pl.callback ) );
    };

    const orgComponentWillMount = target.componentWillMount;
    clazz.componentWillMount = function() {
        if( !!orgComponentWillMount ) orgComponentWillMount.call( this );
    };

    const orgComponentWillUnmount = target.componentWillUnmount;
    clazz.componentWillUnmount = function() {
        listener.stopListeningToAll();
        if( !!orgComponentWillUnmount ) orgComponentWillUnmount.call( this );
    };

    clazz.listenTo = function( listenable: Listenable, callback: Function | string, afterMounting: boolean = true ) {
        var thisComponent = this;

        if( mountedOnly ) {
            pendingListenables.push( { listenable, callback } );
        }
        else {
            if( typeof callback === 'function' ) {
                listener.listenTo( listenable, function() {
                    callback.apply( thisComponent, arguments );
                } );
            }
            else if( !!listenable.state ) {
                this.state = this.state || {};
                this.state[ callback ] = listenable.state;

                listener.listenTo( listenable, ( value ) => this.setState( { [key]: value } ) );
            }
        }
    };
}
