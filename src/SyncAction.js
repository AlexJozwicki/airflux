/* @flow */
import Action                   from './Action';
import type { ActionFunctor }   from './Action';


export default class SyncAction extends Action {
    constructor() {
        super();
    }

    get asFunction() : ActionFunctor {
        return this.createFunctor( this.triggerSync );
    }
}
