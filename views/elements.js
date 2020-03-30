
const LookupView = (file)=>{
    if (file.path === '/🎛.yaml'){
        return new ManifestView(file);
    }
    return new EditorView(file);
};


class EditorView extends ViewContentBase{
    constructor(file) {
        super();
        this._file = file;
    }

    connectedCallback(){
        let content = document.createElement('div');
        content.innerText = this._file.value;

        let footer = document.createElement('footer');
        footer.innerText = this._file.id; // TODO

        this.appendChild(content);
        this.appendChild(footer);
    }
}

class ManifestView extends ViewContentBase{
    constructor(file) {
        super();
        this._file = file;
    }

    connectedCallback(){
        this.innerHTML = file.value;
    }
}

window.customElements.define('ide-view-editor', EditorView);
window.customElements.define('ide-view-manifest', ManifestView);
