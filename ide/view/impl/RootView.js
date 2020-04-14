'use strict';
class RootView extends ViewContent{
    constructor(sourceFile, sourceChangeSet) {
        super(sourceFile, sourceChangeSet);
    }

    receive(){
        this.innerText= 'hi';
        return Promise.resolve();
    }

}
window.customElements.define('ide-view-root', RootView);