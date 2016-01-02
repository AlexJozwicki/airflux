import Action from './Action';


export default class SyncAction extends AbstractAction {
    constructor() {
        super( true );
    }

    get sync() : boolean { return true; }
}
