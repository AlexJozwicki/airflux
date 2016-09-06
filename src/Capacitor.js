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
export default class Capacitor extends React.Component {
    listenTo( publisher: Store< * > | Action< * >, callback: Function ) : any {}
    connectStore( store: Store< any >, stateKey: string ) : any {}

    props               : { [ name: string ]: Store< any > };
    state               : { [ name: string ]: Store< any > } = {};

    constructor( props: any ) {
        super( props );

//        ( this: FluxListener );


        Object.keys( props )
              .filter( key => key != 'children' && typeof props[ key ].listen === 'function' )
              .forEach( key => this.connectStore( props[ key ], key ) );
    }

    render() : React.Element< * > {
        invariant( React.Children.count( this.props.children ) == 1, 'Capacitor should only have one child' );
        return React.cloneElement( React.Children.only( this.props.children ), this.state );
    }
}
