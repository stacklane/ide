
'use strict';

// https://developers.google.com/web/fundamentals/web-components/customelements
// https://developers.google.com/web/fundamentals/web-components/shadowdom
// https://medium.com/dev-channel/the-case-for-custom-elements-part-1-65d807b4b439
// https://medium.com/dev-channel/the-case-for-custom-elements-part-2-2efe42ce9133

// TODO spec: However, note that connectedCallback can be called more than once, so any initialization work
//     that is truly one-time will need a guard to prevent it from running twice.

class IDEComponent extends HTMLElement{
    constructor() {
        super();
    }

    get sessionBase(){
        return document.documentElement.getAttribute("data-session-base-href")
    }

    get root(){
        return this.closest('ide-root');
    }

    get loading() {
        return this.hasAttribute('loading');
    }

    set loading(val) {
        (val) ? this.setAttribute('loading', '') :
            this.removeAttribute('loading');
    }

    get active() {
        return this.hasAttribute('active');
    }

    set active(val) {
        (val) ? this.setAttribute('active', '') :
            this.removeAttribute('active');
    }

    remove(){
        if (this.parentElement) this.parentElement.removeChild(this);
    }
}

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

        viewTab.view.load(()=>{
            viewTab.loading = false;
            viewTab.view.loading = false;
        });
    }

    connectedCallback(){
        this._tabs = document.createElement('ide-tabs');
        //this._footer = document.createElement('footer');
        this.appendChild(this._tabs);
        //this.appendChild(this._footer);
    }
}
window.customElements.define('ide-workspace', Workspace);


class ViewTab extends IDEComponent{
    constructor(view, id, display) {
        super();
        this.setAttribute('data-id', id);
        this._view = view;
        this._display = display;
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
        let nextSelection = this.active ? this.previousElementSibling : null;

        this.deactivate();
        this.view.remove();
        this.remove();

        if (nextSelection != null && nextSelection instanceof ViewTab){
            nextSelection.activate();
        }
    }

    connectedCallback(){
        this.setAttribute('role', 'tab');
        let display = document.createElement('span');
        display.innerText = this._display + ' ';

        let that = this;

        let close = document.createElement('ide-view-tab-closer');
        close.addEventListener('click', ()=>that.close());

        this.addEventListener('click', ()=>that.activate());

        this.append(display);
        this.append(close);
    }
}
window.customElements.define('ide-view-tab', ViewTab);
window.customElements.define('ide-view-tab-closer', class extends IDEComponent{constructor(){super()}});

function _decodeBase64Unicode(str) {
    // https://attacomsian.com/blog/javascript-base64-encode-decode
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

class View extends IDEComponent { // TODO subclass inner part of view?
    constructor(fileId) {
        super();
        this._fileId = fileId;
    }

    // TODO return promise instead of passing success
    load(success){
        this.loading = true;

        let that = this;

        fetch(this.sessionBase + '/api/files/' + this._fileId + '/data')
            .then((response) => {
                let file = JSON.parse(_decodeBase64Unicode(response.headers.get('X-File')));
                let view = ViewCreate(file.path);
                if (!view) throw 'Unhandled view';
                that.appendChild(view);
                view.receive(response, file).then(()=>{
                    if (success) success();
                });
            });
    }

    connectedCallback(){

    }
}
window.customElements.define('ide-view', View);

class ViewContentBase extends HTMLElement{
    constructor() {
        super();
    }

}

class IDE extends HTMLElement {
    constructor() {
        super();
    }

    get workspace(){
        return this.querySelector('ide-workspace');
    }

    openFile(file){
        let work = this.workspace;

        let id = 'view-' + file.id;

        let existing = work.findViewTab(id);

        if (existing) {
            existing.activate();
            return;
        }

        let view = new View(file.id);
        let tab = new ViewTab(view, id, file.name);

        work.addViewTab(tab);

        return view;
    }

    connectedCallback(){
        console.log('ide-root connected');
        let template = document.createElement('template');

        // TODO TBD immediate sibling before <main>:
        //     <nav>Toolbar</nav>

        template.innerHTML = `  
           <main> 
             <ide-files></ide-files>
             <ide-workspace></ide-workspace> 
           </main>
        `;

        this.append(template.content.cloneNode(true));
    }
}
window.customElements.define('ide-root', IDE);


