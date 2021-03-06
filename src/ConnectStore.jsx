/* @flow */
import * as React from 'react';
import PropTypes            from 'prop-types';
import invariant            from 'invariant';

// airflux
import Listener from './Listener';
import type Publisher from './Publisher';
import type Action from './Action';
import type Store from './Store';
import Environment from './Environment';
import type { AirfluxApi } from './AirfluxApi';


type ConnectStoreProps = {
  environment?: Environment;
  render: ( stores: { [ name: string ]: any } ) => any;
  stores?: { [key: string ]: Store< any > };
  query?: ( stores: { [ name: string ]: any } ) => { [ name: string ]: any };
};



/**
 */
export default class ConnectStore extends React.Component< ConnectStoreProps, { [ name: string ]: any }> {
    static contextTypes = { airflux: PropTypes.object };

    _listener: Listener = new Listener();

    constructor( props: ConnectStoreProps, context: any ) {
        super( props );

        var publishers = this._getEnvironment( props, context ).getPublishers();

        if( Object.keys( publishers ).length > 0 ) {
            this.state = Object.keys( publishers )
                .map( ( name ) => ( { [name]: publishers[ name ].state } ) )
                .reduce( ( a, b ) => Object.assign( {}, a, b ) );
        }
    }

    _getEnvironment( p?: ConnectStoreProps, c?: any ): Environment {
        const props = p || this.props;
        const context = c || this.context;

        if( !!context && !!context.airflux ) {
            return context.airflux.environment;
        }
        else if( !!props && !!props.environment ) {
            return props.environment;
        }
        else {
            return new Environment( props.stores );
        }
    }

    getPublishers() : { [key: string ]: Store< any > } {
        return this._getEnvironment().getPublishers();
    }

    componentDidMount() {
      var publishers = this._getEnvironment().getPublishers();
      Object.keys( publishers )
        .forEach( ( st ) => this._listenToStore( publishers[ st ], st ) );
    };

    /**
     * Starts listening to a store.
     * The state of the store will be connected to the state of the componentWillUnmount
     * @param  {Store} store
     * @param  {string} stateKey
     */
    _listenToStore( store: Store< * >, stateKey: string ) {
        this._listener.listenTo( store, ( value ) => this.setState( { [stateKey]: value } ) );
    }

    render() {
        const query = this.props.query || ( ( a ) => a );
        return this.props.render( query( this.state ) );
    }
}
