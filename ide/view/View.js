'use strict';

/*
function _decodeBase64Unicode(str) {
    // https://attacomsian.com/blog/javascript-base64-encode-decode
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}*/

/**
 * Container for "ViewContent" implementations.
 */
class View extends AppComponent {

    static createId(sourceFile){
        return 'view-' + sourceFile.handle;
    }

    static get observedAttributes() { return [UITab.ActivatedAttribute]; }

    constructor(fileInfo) {
        super();
        if (!(fileInfo instanceof SourceFile)) throw '!SourceFile';

        this._fileInfo = fileInfo;
        this._fileId = fileInfo.id;
        this._filePath = fileInfo.path;

        this.id = View.createId(fileInfo);

        const that = this;
        this.addEventListener('focus' /* TBD, 'focusin' bubbles */, ()=>that.activate);
    }

    toString(){
        return 'View[' + this.path + ']';
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === UITab.ActivatedAttribute && newValue === 'true'){
            this.activate();
        } else {
            this.deactivate();
        }
    }

    activate(){
        console.log('activate: ' + this._fileInfo.path);
        this.active = true;
        this.root.showPath(this._fileInfo);
        if (this._view) this._view.showFocus();
    }

    deactivate(){
        console.log('deactivate: ' + this._fileInfo.path);
        this.active = false;
    }

    save(){
        if (this._view instanceof ViewContent) this._view.save();
    }

    remove(){
        this.save();
        super.remove();
    }

    get path(){
        return this._filePath;
    }

    createTab(title, closeable){
        if (closeable) {
            const closer = new UITabCloser();
            closer.classList.add('ide-view-tab-closer');

            const tab = UITab.create([title, closer], this);
            tab.classList.add('ide-view-tab');
            return tab;
        } else {
            const tab = UITab.create([title], this);
            tab.classList.add('ide-view-tab');
            return tab;
        }
    }

    load(){
        this.loading = true;

        const createView = (response)=>{
            const view = ViewContent.lookup(this._fileInfo, this.root.sourceChangeSet);

            if (!view) throw 'Unable to view: ' + this._fileInfo.path;

            this.appendChild(view);
            this._view = view;
            return view.receive(response);
        };

        if (this._fileInfo.isDir){
            return createView(null);
        }

        const changeSetResponse = this.root.sourceChangeSet.readExisting(this._fileInfo);
        if (changeSetResponse.ok) return createView(changeSetResponse);

        return this.root.api.readData(this._fileId)
            .then((response) => {
                // WARNING: this probably doesn't make sense as-is, because it could lead to file tree source getting out of sync with e.g. current version.
                //  one possibility however, is that we update the SourceFile's version (at least) when we load the file data.
                //const file = JSON.parse(_decodeBase64Unicode(response.headers.get('X-File')));
                //const fileInfo = SourceFile.of(file);
                return createView(response);
            }).catch((e)=>{
                this.innerHTML = '';
                const view = new _ErrorView('Unable to view: ' + e);
                this.appendChild(view);
                this._view = view;
                return Promise.resolve();
            });
    }

}
window.customElements.define('ide-view', View);


class _ErrorView extends HTMLElement {
    constructor(message) {
        super();
        let div = document.createElement('div');
        div.innerText = message;
        this.appendChild(div);
    }
}
window.customElements.define('ide-view-error', _ErrorView);
