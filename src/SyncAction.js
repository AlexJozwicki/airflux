/* @flow */
import Action                   from './Action';
import type { ActionFunctor }   from './Action';


export default class SyncAction< T > extends Action< T > {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }

    get asFunction() : ActionFunctor< T > {
        return this.createFunctor( this.triggerSync );
    }
}
