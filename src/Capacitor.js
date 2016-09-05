/* @flow */
import React, { PropTypes }                             from 'react';
import FluxComponent                                    from './FluxComponent';
import type Store from './Store';
import invariant from 'invariant';


/**
 */
@FluxComponent
export default class Capacitor extends React.Component {
    connectStore        : ( store: Store< any >, stateKey: string ) => void;

    props               : { [ name: string ]: Store< any > };
    state               : { [ name: string ]: Store< any > } = {};

    constructor( props: any ) {
        super( props );

        Object.keys( props )
              .filter( key => key != 'children' && typeof props[ key ].listen === 'function' )
              .forEach( key => this.connectStore( props[ key ], key ) );
    }

    render() : React.Element< * > {
        invariant( React.Children.count( this.props.children ) == 1, 'Capacitor should only have one child' );
        return React.cloneElement( React.Children.only( this.props.children ), this.state );
    }
}
