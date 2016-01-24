/* @flow */
import Action                   from './Action';
import type { ActionFunctor }   from './Action';


export default class SyncAction extends Action {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }

    get asFunction() : ActionFunctor {
        return this.createFunctor( this.triggerSync );
    }
}
