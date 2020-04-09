function _decodeBase64Unicode(str) {
    // https://attacomsian.com/blog/javascript-base64-encode-decode
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

class ErrorView extends HTMLElement {
    constructor(message) {
        super();
        let div = document.createElement('div');
        div.innerText = message;
        this.appendChild(div);
    }
}
window.customElements.define('ide-view-error', ErrorView);

/**
 * Container for "ViewContentBase" implementations.
 */
class View extends IDEComponent {

    static CreateId(fileInfo){
        return 'view-' + fileInfo.id;
    }

    static get observedAttributes() { return [UITab.ActivatedAttribute]; }

    constructor(fileInfo) {
        super();
        if (!(fileInfo instanceof FileInfo)) throw '!FileInfo';

        this._fileInfo = fileInfo;
        this._fileId = fileInfo.id;
        this._filePath = fileInfo.path;

        this.id = View.CreateId(fileInfo);

        const that = this;
        this.addEventListener('focus' /* TBD, 'focusin' bubbles */, ()=>that.activate);
    }

    toString(){
        return 'View[' + this.path + ']';
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.active = (name === UITab.ActivatedAttribute && newValue === 'true');
    }

    activate(){
        this.active = true;
        this.root.showPath(this._fileInfo);
        if (this._view) this._view.showFocus();
    }

    deactivate(){
        this.active = false;
    }

    get path(){
        return this._filePath;
    }

    createTab(){
        const title = document.createElement('span');
        title.innerText = this._fileInfo.display + ' ';

        const closer = new UITabCloser();
        closer.classList.add('ide-view-tab-closer');

        const tab = new UITab([title, closer], this);
        tab.classList.add('ide-view-tab');

        return tab;
    }

    load(){
        this.loading = true;

        let that = this;

        return fetch(this.sessionBase + '/api/files/' + this._fileId + '/data')
            .then((response) => {
                const file = JSON.parse(_decodeBase64Unicode(response.headers.get('X-File')));
                const fileInfo = new FileInfo(file);
                const view = LookupView(fileInfo);
                if (view) {
                    that.appendChild(view);
                    this._view = view;
                    return view.receive(response);
                } else {
                    const error = new ErrorView('Unable to view: ' + file.path);
                    that.appendChild(error);
                    this._view = error;
                    return Promise.resolve();
                }
            }).catch((e)=>{
                that.innerHTML = '';
                const view = new ErrorView('Unable to view: ' + e);
                that.appendChild(view);
                this._view = view;
                return Promise.resolve();
            });
    }

}
window.customElements.define('ide-view', View);