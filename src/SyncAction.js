import Action from './Action';


export default class SyncAction extends Action {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }
}
