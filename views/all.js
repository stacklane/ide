
const ViewCreate = (path)=>{
    // Derive everything expected from path alone
    if (path === '/🎛.yaml'){
        return new ManifestView(path);
    } else {
        return new EditorView(path);
    }
};

/**
 * Superclass for views
 */
class ViewContentBase extends HTMLElement{
    constructor() {
        super();
    }
}

class ErrorView extends ViewContentBase{
    constructor(message) {
        super();
        let div = document.createElement('div');
        div.innerText = message;
        this.appendChild(div);
    }
}
window.customElements.define('ide-view-error', ErrorView);


class EditorView extends ViewContentBase{
    constructor() {
        super();
    }

    receive(response, file){
        let ct = response.headers.get('Content-Type');
        if (ct.indexOf('text/plain') !== 0) throw ct;

        let that = this;

        return response.text().then((value)=>{
            that.querySelector('div').innerText = value;
            that.querySelector('footer').innerText = file.path;
        });
    }

    connectedCallback(){
        let content = document.createElement('div');
        let footer = document.createElement('footer');

        this.appendChild(content);
        this.appendChild(footer);
    }
}
window.customElements.define('ide-view-editor', EditorView);


class ManifestView extends ViewContentBase{
    constructor(path) {
        super();
        this._path = path;
    }

    receive(response, file, success){
        let ct = response.headers.get('Content-Type');
        if (ct.indexOf('text/plain') !== 0) throw ct;

        let that = this;

        return response.text().then((value)=>{
            that.querySelector('div').innerText = value;
           // that.querySelector('footer').innerText = file.path;
        });
    }

    connectedCallback(){
        let content = document.createElement('div');
        //let footer = document.createElement('footer');

        this.appendChild(content);
        //this.appendChild(footer);
    }
}
window.customElements.define('ide-view-manifest', ManifestView);

