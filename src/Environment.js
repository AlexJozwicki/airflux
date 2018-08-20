/** @flow */
import Publisher from './Publisher';
import type Store from './Store';


export default class Environment {
    $key: string;
    $value: Store< any >;

    constructor( stores: { [key: string ]: Store< any > } = {} ) {
        Object.keys( stores ).forEach( ( key ) => this[ key ] = stores[ key ] );
    }
    

    getPublishers(): { [key: string ]: Store< any > } {
        return Object.keys( this )
          .filter( key => typeof this[ key ].listen === 'function' )
          .map( key => ( { [key]: this[ key ] } ) )
          .reduce( ( a, b ) => Object.assign( {}, a, b ) );
    }
}
