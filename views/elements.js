
const ViewCreate = (path)=>{
    // Derive everything expected from path alone
    if (path === '/🎛.yaml'){
        return new ManifestView(path);
    } else {
        return new EditorView(path);
    }
};

class EditorView extends ViewContentBase{
    constructor(path) {
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

window.customElements.define('ide-view-editor', EditorView);
window.customElements.define('ide-view-manifest', ManifestView);
