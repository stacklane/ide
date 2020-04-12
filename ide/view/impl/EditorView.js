'use strict';
class EditorView extends ViewContent{
    constructor(sourceFile, sourceChangeSet) {
        super(sourceFile, sourceChangeSet);
    }

    showFocus(){
        super.showFocus();
        if (this._content) this._content.showFocus();
    }

    save(){
        // TODO only do this if change/dirty
        this.sourceChangeSet.update(this.sourceFile, this._content.value);
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
