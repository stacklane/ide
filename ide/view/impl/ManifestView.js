'use strict';

/**
 * TODO this would be based on 🎛.yaml , but would also handle 🎛.svg
 */
class ManifestView extends ViewContent{
    constructor(sourceContext) {
        super(sourceContext);
        const content = document.createElement('div');
        this.appendChild(content);
    }

    receive(response){
        let ct = response.headers.get('Content-Type');
        if (ct.indexOf('text/plain') !== 0) throw ct;

        let that = this;

        return response.text().then((value)=>{
            that.querySelector('div').innerText = value;
            // that.querySelector('footer').innerText = file.path;
            return true;
        });
    }
}
window.customElements.define('ide-view-manifest', ManifestView);
