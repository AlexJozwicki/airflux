/* @flow */
interface Bob {
  print(): string;
}



class A implements Bob {
  print() { return 'test'; }
}


class B extends A {

}

class C< A > {

}

function foo( a: A ) {

}


class D extends C< B > {

}

foo( new B() )

var fn = ( msg: string ) => { console.log( msg ); return 15; }
fn.listenTo = () => console.log( "bob" )

type Fn = ( ( msg: string ) => number ) & { listenTo: () => void }

var f = fn;


import AsyncResultAction from './AsyncResultAction';

const a = new AsyncResultAction( ( msg: string ) => Promise.resolve( msg ) ).asFunction;
