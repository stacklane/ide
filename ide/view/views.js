/**
 * @param fileInfo
 * @return {ViewContentBase}
 * @constructor
 */
const LookupView = (fileInfo)=>{
    if (fileInfo.isManifest){
        return new ManifestView(fileInfo);
    } else {
        return new EditorView(fileInfo);
    }
};

/**
 * Superclass for FileInfo-based views.
 */
class ViewContentBase extends HTMLElement{
    constructor(fileInfo) {
        super();
        this._fileInfo = fileInfo;
    }

    get fileInfo(){
        return this._fileInfo;
    }

    showFocus(){

    }

    receive(response){
        return Promise.reject(new Error('not implemented: #receive'));
    }
}

class EditorView extends ViewContentBase{
    constructor(fileInfo) {
        super(fileInfo);
    }

    showFocus(){
        super.showFocus();
        if (this._content) this._content.showFocus();
    }

    /**
     * @param response {Response}
     */
    receive(response){
        const ct = response.headers.get('Content-Type');
        if (ct.indexOf('text/plain') !== 0) throw ct;

        const lang = this.fileInfo.extension;
        const content = new TextCodeEdit(lang);
        const footer = document.createElement('footer');

        this._content = content;

        this.appendChild(content);
        this.appendChild(footer);

        return response.text().then((value)=>{
            content.value = value;
            footer.innerText = this.fileInfo.path;
            return true;
        });
    }
}
window.customElements.define('ide-view-editor', EditorView);


class ManifestView extends ViewContentBase{
    constructor(fileInfo) {
        super(fileInfo);
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

