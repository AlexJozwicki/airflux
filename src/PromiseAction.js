import Action from './Action';



/**
 *
 */
export default class PromiseAction extends AbstractAction {
    constructor( listenFunction: () => Promise ) {
        super( false );

        // invariant( typeof listenFunction === 'function', '' );

        this.children = {
            completed   : new Action(),
            failed      : new Action()
        };

        this.listen( listenFunction );
    }

    get sync() : boolean { return false; }


    /**
    * Returns a function to trigger the action, async or sync depending on the action definition.
     */
    get asFunction() : Functor {
        return this._createFunctor( true );
    }
}
