import Action from './Action';


export default class SyncAction extends Action {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }

    get asFunction() : Functor {
        return this._createFunctor( this.triggerSync );
    }
}
