/**
 * Structure for holding meta information about both concrete files, and directories.
 */
class FileInfo extends Object{
    constructor(file) {
        super();

        if (file instanceof Object) {
            if (!file.id) throw '!file.id';
            this._id = file.id;
            this._extension = file.extension;
            this._path = file.path;
            this._name = file.name;
            this._isDir = false;
        } else if (typeof file === 'string'){
            this._id = null;
            this._path = file;
            this._isDir = file.endsWith('/');
        } else {
            throw file + '';
        }

        const p = this._path.split('/');

        if (this.isDir){
            this._parts = p.slice(1, p.length - 1); // skip the root slash and ending slash
            this._name = this._parts[this._parts.length - 1];
        } else {
            this._parts = p.slice(1); // skip the root slash
            if (!this._name) this._name = this._parts[this._parts.length - 1];
        }

        this._displayParts = this._parts;
        this._display = this._name;
    }

    toString(){
        return 'FileInfo[' + this._path + ']';
    }

    get isDir(){
        return this._isDir;
    }

    get isFile(){
        return !this._isDir;
    }

    get extension(){
        return this._extension;
    }

    get id(){
        return this._id;
    }

    get path(){
        return this._path;
    }

    get name(){
        return this._name;
    }

    get dirParts(){
        if (this.isDir){
            return this.parts;
        } else {
            return this.parts.slice(0, this.parts.length - 1);
        }
    }

    get partsInfo(){
        if (this._partsInfo) return this._partsInfo;
        const out = [];
        const parts = this.parts;
        let dirPath = '/';
        for (let i = 0; i < parts.length - 1 /* skip last part, which is THIS object */; i++){
            dirPath += parts[i] + '/';
            out.push(new FileInfo(dirPath));
        }
        out.push(this);
        this._partsInfo = out;
        return out;
    }

    get parts(){
        return this._parts;
    }

    /**
     * May differ from #parts
     */
    get displayParts(){
        return this._displayParts;
    }

    /**
     * May differ from #name
     */
    get display(){
        return this._display;
    }
}

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

    _loadAppMeta(){
        const that = this;
        return fetch(this.sessionApiBase + '/')
            .then((response) => response.json())
            .then((json) =>that.updateAppName(json.name));
    }

    async updateAppName(name){
        if (!name) name = 'Project';
        this._appName = name;
        this.showPath(this._files.rootDir.info);
    }

    async _createToolbarPathAction(fileInfo, pathItem){
        const action = document.createElement('div');
        action.classList.add('action');

        if (fileInfo.isDir){
            const fileDir = this._files.findPath(fileInfo.path);
            if (fileDir && fileDir instanceof FileDir){
                const childInfo = fileDir.childInfo;
                for (let i = 0; i < childInfo.length; i++) {
                    const childItem = document.createElement('div');
                    childItem.innerText = childInfo[i].display;
                    action.appendChild(childItem);
                }
                pathItem.appendChild(action);
            }
        } else {
            const childItem = document.createElement('div');
            childItem.classList.add('action-delete');
            pathItem.appendChild(childItem);
        }
    }

    async showPath(fileInfo){
        if (!(fileInfo instanceof FileInfo)) throw '!FileInfo:' + fileInfo;

        const existingPath = this.querySelector('ide-toolbar-path');

        const newPath = document.createElement('ide-toolbar-path');
        //newPath.setAttribute('data-file-path', fileInfo.path);

        {
            const rootItem = document.createElement('ide-toolbar-path-item');
            rootItem.classList.add('has-action', 'is-app-name');
            rootItem.setAttribute('tabindex', '0'); // zero is recommended value, to use document order
            rootItem.innerText = this._appName;
            newPath.appendChild(rootItem);

            this._createToolbarPathAction(this._files.rootDir.info, rootItem);
        }

        const partsInfo = fileInfo.partsInfo;

        for (let i = 0; i < fileInfo.displayParts.length; i++){
            const item = document.createElement('ide-toolbar-path-item');
            item.classList.add('has-action');
            item.setAttribute('tabindex', '0'); // zero is recommended value, to use document order
            item.innerText = fileInfo.displayParts[i];

            this._createToolbarPathAction(partsInfo[i], item);

            newPath.appendChild(item);
        }

        existingPath.replaceWith(newPath);
    }

    get _files(){
        return this.querySelector('ide-files');
    }

    ready(){
        this._sessionBase = this.getAttribute("data-session-base-href");
        this._sessionApiBase = this.getAttribute("data-session-base-api-href");

        this._files.refresh();
        this._loadAppMeta();

        this.removeAttribute('init');

    }

    openFile(fileInfo){
        let work = this.workspace;

        let id = 'view-' + fileInfo.id;

        let existing = work.findViewTab(id);

        if (existing) {
            existing.activate();
            return;
        }

        let view = new View(fileInfo);
        let tab = new ViewTab(view, fileInfo);

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