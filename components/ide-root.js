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

    showPath(item /* FileItem | FileDir | View */){
        const path = item.path;
        if (!path) return null;

        const parts = path.split('/');

        const existingPath = this.querySelector('ide-toolbar-path');

        const newPath = document.createElement('ide-toolbar-path');

        for (let i = 0; i < parts.length; i++){
            const val = parts[i];
            if (val.length === 0) continue; // skip both leading and trailing slash (dir)
            const item = document.createElement('ide-toolbar-path-item');
            item.innerText = val;
            newPath.appendChild(item);
        }

        existingPath.replaceWith(newPath);
    }

    ready(){
        this._sessionBase = this.getAttribute("data-session-base-href");
        this._sessionApiBase = this.getAttribute("data-session-base-api-href");

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

        let view = new View(file.id, file.path);
        let tab = new ViewTab(view, id, file.name);

        work.addViewTab(tab);

        return view;
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