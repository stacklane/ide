'use strict';
class RootView extends ViewContent{
    constructor(sourceContext) {
        super(sourceContext);
    }

    receive(){
        this.innerText= 'hi';
        return Promise.resolve();
    }

}
window.customElements.define('ide-view-root', RootView);