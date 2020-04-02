
'use strict';

// https://developers.google.com/web/fundamentals/web-components/customelements
// https://developers.google.com/web/fundamentals/web-components/shadowdom
// https://medium.com/dev-channel/the-case-for-custom-elements-part-1-65d807b4b439
// https://medium.com/dev-channel/the-case-for-custom-elements-part-2-2efe42ce9133


class Tabs extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ide-tabs', Tabs);

class Workspace extends IDEComponent {
    constructor() {
        super();
    }

    findViewTab(id){
        return this._tabs.querySelector('ide-view-tab[data-id="' + id + '"]');
    }

    addViewTab(viewTab){
        viewTab.loading = true;
        viewTab.view.loading = true;

        this._tabs.appendChild(viewTab);
        this.appendChild(viewTab.view);

        viewTab.activate();

        viewTab.view.load().then(()=>{
            viewTab.loading = false;
            viewTab.view.loading = false;
        });
    }

    connectedCallback(){
        this._tabs = this.querySelector('ide-toolbar > ide-toolbar-left');
        if (!this._tabs) throw '!workspace.tabs';
    }
}
window.customElements.define('ide-workspace', Workspace);


class ViewTabCloser extends HTMLElement {
    constructor(){super()}
}
window.customElements.define('ide-view-tab-closer', ViewTabCloser);

class ViewTab extends IDEComponent{
    constructor(view, id, display) {
        super();

        this.setAttribute('role', 'tab');
        this.setAttribute('data-id', id);

        this._view = view;
        this._display = display;

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

    activate(){
        if (this.parentElement)
            this.parentElement.querySelectorAll('ide-view-tab').forEach(e=>e.deactivate());

        this.active = true;
        this.setAttribute('aria-selected', 'true');
        this.view.active = true;
    }

    deactivate(){
        this.active = false;
        this.setAttribute('aria-selected', 'false');
        this.view.active = false;
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

function _decodeBase64Unicode(str) {
    // https://attacomsian.com/blog/javascript-base64-encode-decode
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * Container for "ViewContentBase" implementations.
 */
class View extends IDEComponent {
    constructor(fileId, filePath) {
        super();
        this._fileId = fileId;
        this._filePath = filePath;
    }

    load(){
        this.loading = true;

        let that = this;

        return fetch(this.sessionBase + '/api/files/' + this._fileId + '/data')
            .then((response) => {
                let file = JSON.parse(_decodeBase64Unicode(response.headers.get('X-File')));
                let view = ViewCreate(file.path);
                if (view) {
                    that.appendChild(view);
                    return view.receive(response, file);
                } else {
                    that.appendChild(new ErrorView('Unable to view: ' + file.path));
                    return Promise.resolve();
                }
            }).catch((e)=>{
                that.innerHTML = '';
                that.appendChild(new ErrorView('Unable to view: ' + e));
                return Promise.resolve();
            });
    }

}
window.customElements.define('ide-view', View);




