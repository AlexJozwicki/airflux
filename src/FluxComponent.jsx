var React   = require( 'react' );
var Listener= require( './Listener' );


/**
 * A component that is wired on Airflux or Reflux stores.
 */
class FluxComponent extends React.Component {
    constructor( props, listenables ) {
        super( props );
        this.state = {};
        this.listenables = listenables;
        this._listener = new Listener();

        for( var key in this.listenables ) {
            let listenable = this.listenables[key];
            if( !_.isFunction( this[key] ) )
                this.state[key] = listenable.state;
        }
    }

    /**
     * Checks whether every stores have returned a value
     * @private
     * @return {Boolean}
     */
    areStoresConnected() {
        var res = true;
        for( var key in this.listenables ) {
            res = res && this.state[ key ];
        }
        return res;
    }

    /**
     * Listen to all stores
     */
    componentDidMount() {
        var thisComponent = this;
        for( var key in this.listenables ) {
            let listenable = this.listenables[key];
            if( _.isFunction( this[key] ) ) {
                this._listener.listenTo( listenable, function() {
                    thisComponent[key]( ...arguments )
                } );
            }
            else
                this._listener.listenTo( listenable, ( value ) => this.setState( { [key]: value } ) );
        }
    }


    /**
     * Unregister from the stores
     */
    componentWillUnmount() {
        this._listener.stopListeningToAll();
    }
}

module.exports = FluxComponent;
