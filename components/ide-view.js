function _decodeBase64Unicode(str) {
    // https://attacomsian.com/blog/javascript-base64-encode-decode
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

class ViewTabCloser extends HTMLElement {
    constructor(){super()}
}
window.customElements.define('ide-view-tab-closer', ViewTabCloser);

class ViewTab extends IDEComponent{
    constructor(view, fileInfo) {
        super();

        this.setAttribute('role', 'tab');
        this.setAttribute('data-id', fileInfo.id);

        this._view = view;
        this._display = fileInfo.display;

        const displaySpan = document.createElement('span');
        displaySpan.innerText = this._display + ' ';
        this.append(displaySpan);

        const that = this;

        const close = new ViewTabCloser();
        close.addEventListener('click', ()=>that.close());

        this.addEventListener('click', ()=>that.activate());

        this.append(close);
    }

    get view() {
        return this._view;
    }

    toString(){
        return 'ViewTab[' + this.view.path + ']';
    }

    activate(){
        if (this.parentElement)
            this.parentElement.querySelectorAll('ide-view-tab').forEach(e=>e.deactivate());

        this.active = true;
        this.setAttribute('aria-selected', 'true');

        this.view.activate();
    }

    deactivate(){
        this.active = false;
        this.setAttribute('aria-selected', 'false');
        this.view.deactivate();
    }

    close(){
        // If active, then auto-select to left (preferred), or right (as fallback), or nothing:
        const nextSelection = this.active ?
            (this.previousElementSibling ?
                this.previousElementSibling : this.nextElementSibling)
            : null;

        this.deactivate();
        this.view.remove();
        this.remove();

        if (nextSelection != null && nextSelection instanceof ViewTab) {
            nextSelection.activate();
        }
    }
}
window.customElements.define('ide-view-tab', ViewTab);

/**
 * Container for "ViewContentBase" implementations.
 */
class View extends IDEComponent {
    constructor(fileInfo) {
        super();
        if (!(fileInfo instanceof FileInfo)) throw '!FileInfo';

        this._fileInfo = fileInfo;
        this._fileId = fileInfo.id;
        this._filePath = fileInfo.path;

        const that = this;
        this.addEventListener('focus' /* TBD, 'focusin' bubbles */, ()=>that.activate);
    }

    toString(){
        return 'View[' + this.path + ']';
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

    load(){
        this.loading = true;

        let that = this;

        return fetch(this.sessionBase + '/api/files/' + this._fileId + '/data')
            .then((response) => {
                const file = JSON.parse(_decodeBase64Unicode(response.headers.get('X-File')));
                const fileInfo = new FileInfo(file);
                const view = ViewCreate(file.path);
                if (view) {
                    that.appendChild(view);
                    this._view = view;
                    return view.receive(response, fileInfo);
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