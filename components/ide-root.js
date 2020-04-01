class IDERoot extends HTMLElement {
    constructor() {
        super();
    }

    get workspace(){
        return this.querySelector('ide-workspace');
    }

    get sessionBase(){
        return this._sessionBase;
    }

    get sessionApiBase(){
        return this._sessionApiBase;
    }

    ready(){
        this._sessionBase = document.documentElement.getAttribute("data-session-base-href");
        this._sessionApiBase = this._sessionBase + '/api';

        let files = this.querySelector('ide-files');
        files.refresh();

        this.removeAttribute('init');
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
        // Leave setup to hardcoded structure, for better deferred handling.
    }
}
window.customElements.define('ide-root', IDERoot);

/**
 * Superclass which provides simple implementation specific #loading #active,
 * and other environment related utilities.
 */
class IDEComponent extends HTMLElement{
    constructor() {
        super();
    }

    get sessionBase(){
        return this.root.sessionBase;
    }

    get root(){
        if (this._root) return this._root;
        this._root = this.closest('ide-root');
        return this._root;
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