var React   = require( 'react' );
var FluxComponent   = require( './FluxComponent' );


/**
 * A component that is wired on Airflux or Reflux stores.
 */
class FluxConnection extends FluxComponent {
    constructor( props ) {
        super( props, props.stores || {} );
    }

    injectStores( component ) {
        return React.cloneElement( component, this.state );
    }

    render() {
        if( React.Children.count( this.props.children ) === 0 ) {
            return this.injectStores( React.Children.only( this.props.children ) );
        }
        else {
            return <span>{ React.Children.map( this.props.children, ( child ) => this.injectStores( child ) ) }</span>;
        }
    }
}

module.exports = FluxConnection;
