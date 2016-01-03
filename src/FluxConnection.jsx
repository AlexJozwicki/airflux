import React, { Component }   from 'react';
import Flux from './Flux';
import type { Listenable } from './Listenable';


type FluxConnectionProps = {
    stores: { [ key: string ]: Listenable };
};


/**
 * A component that is wired on Airflux or Reflux stores.
 */
@Flux
export default class FluxConnection extends Component {
    constructor( props: FluxConnectionProps ) {
        super( props );
        const stores = props.stores;
        Object.keys( props.stores ).forEach( ( key ) => this.listenTo( stores[ key ], key ) );
    }

    _injectStores( component: ReactElement ) {
        return React.cloneElement( component, this.state );
    }

    render() : ReactElement {
        if( React.Children.count( this.props.children ) === 0 ) {
            return this._injectStores( React.Children.only( this.props.children ) );
        }
        else {
            return <span>{ React.Children.map( this.props.children, ( child ) => this._injectStores( child ) ) }</span>;
        }
    }
}
