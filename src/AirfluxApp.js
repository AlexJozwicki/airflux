/* @flow */
import * as React from 'react';
import PropTypes            from 'prop-types';
import invariant            from 'invariant';
import type Environment     from './Environment';
import type { AirfluxApi }  from './AirfluxApi';


export default class AirfluxApp extends React.Component< { environment: Environment; children: React.Node }, void > {
    getChildContext() : Object { 
        return { airflux: { environment: this.props.environment } }; 
    }
    static childContextTypes = { airflux: PropTypes.object };

    render() {
        return this.props.children;
    }
}
