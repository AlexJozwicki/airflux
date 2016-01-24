/* @flow */
import Action               from './Action';
import type { Functor }     from './Action';


export default class SyncAction extends Action {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }

    get asFunction() : Functor {
        return this.createFunctor( this.triggerSync );
    }
}
