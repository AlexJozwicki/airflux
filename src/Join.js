/* @flow */
var slice = Array.prototype.slice;
import type Publisher from './Publisher';


export default class Join {
    _strategy           : string;
    _args               : Array< any > = [];
    _listenablesEmitted : Array< boolean > = [];
    _callback           : Function;
    _listenables        : Array< Publisher >;



    constructor( listenables: Array< Publisher >, strategy: string ) {
        this._listenables = listenables;
        this._strategy = strategy;
        this._reset();
    }

    get count() : number { return this._listenables.length; }

    _reset() {
        this._listenablesEmitted = new Array( this.count );
        this._args = new Array( this.count );
    }

    listen( callback: Function ) : () => void {
        const cancels = this._listenables.map( ( listenable, i ) => listenable.listen( this._newListener( i ), this ) )
        this._callback = callback;

        return () => cancels.forEach( ( cancel ) => cancel() );
    }

    _newListener( i: number ) : Function {
        return function() {
            var callargs = slice.call( arguments );
            if( this._listenablesEmitted[ i ] ) {
                switch( this._strategy ){
                    case "strict"   : throw new Error( "Strict join failed because listener triggered twice." );
                    case "last"     : this._args[i] = callargs; break;
                    case "all"      : this._args[i].push( callargs );
                }
            } else {
                this._listenablesEmitted[ i ] = true;
                this._args[i] = ( this._strategy === "all" ? [ callargs ] : callargs );
            }

            this._emitIfAllListenablesEmitted();
        };
    }

    _emitIfAllListenablesEmitted() {
        for( var i = 0; i < this.count; ++i ) {
            if( !this._listenablesEmitted[i] ) {
                return;
            }
        }

        this._callback.apply( null, this._args );
        this._reset();
    }
}
