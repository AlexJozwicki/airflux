/* @flow */
import React, { PropTypes }                             from 'react';
import invariant from 'invariant';

// airflux
import type Action                                      from './Action';
import type Store                                       from './Store';

import FluxComponent                                    from './FluxComponent';



/**
 */
@FluxComponent
export default class Capacitor extends React.Component< { [ name: string ]: Store< any > }, { [ name: string ]: Store< any > }> {
    listenTo( publisher: Store< * > | Action< * >, callback: Function ) : any {}
    connectStore( store: Store< any >, stateKey: string ) : any {}

    constructor( props: any ) {
        super( props );

        Object.keys( props )
              .filter( key => key != 'children' && typeof props[ key ].listen === 'function' )
              .forEach( key => this.connectStore( props[ key ], key ) );
    }

    render() {
      
        invariant( React.Children.count( this.props.children ) == 1, 'Capacitor should only have one child' );
        return React.cloneElement( React.Children.only( this.props.children ), this.state );
    }
}
