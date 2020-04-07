// https://joshtronic.com/2015/04/19/handling-click-and-touch-events-on-the-same-element/
const TOUCH_DEVICE = 'ontouchstart' in document.documentElement;
const FILE_NODE_CLICK_EVENT = TOUCH_DEVICE ? 'touchstart' : 'dblclick';
const DOCUMENT_ORDER_TAB_INDEX = '0';

'use strict';

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
            this._version = file.version;
            this._isDir = false;
        } else if (typeof file === 'string'){
            this._id = null;
            this._path = file;
            this._isDir = file.endsWith('/');
            this._isRoot = file === '/';
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

        if (this._isRoot) {
            this._partsInfo = [];
        }
    }

    toString(){
        return 'FileInfo[' + this._path + ']';
    }

    get isManifest(){
        return this.path === '/🎛.yaml';
    }

    get isDeletable(){
        return this.isFile && !this.isManifest && this.isUpdatable;
    }

    get isUpdatable(){
        return this.id && this.version;
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

    get version(){
        return this._version;
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

class Notifications {
    constructor(element) {
        this._element = element;
    }

    _submit(message, taskPromise){
        this._element.appendChild(new Notification(message, taskPromise));
    }

    deleteFile(fileInfo, taskPromise) {
        this._submit('Delete: "' + fileInfo.path + '"', taskPromise);
    }
}

class Notification extends HTMLElement{
    constructor(message, taskPromise) {
        super();
        if (!message) throw '!message';
        if (!taskPromise) throw '!taskPromise';
        this.classList.add('is-pending');
        this._created = new Date();
        this._message = message;
        this.innerText = message;

        taskPromise
            .then(()=>{this.classList.remove('is-pending'); this.classList.add('is-fulfilled')})
            .catch((e)=>{
                this._error = e;
                this.classList.remove('is-pending');
                this.classList.add('is-rejected');
                this.innerHTML = this.innerText + '<br>' + e.message;
                throw e; // Rethrow to keep the taskPromise chain rejected/failed
            });
    }
}
window.customElements.define('ide-notification', Notification);

class IDERoot extends HTMLElement {
    constructor() {
        super();
    }

    get notifications(){
        return this._notifications;
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

    _addAction(fileInfoContext){
        alert('add to: ' + fileInfoContext.path);
    }

    _createAddAction(fileInfo){
        const add = document.createElement('li');
        add.classList.add('is-action-add');
        add.innerText = 'New...';
        add.addEventListener('click', ()=>this._addAction(fileInfo));
        return add;
    }

    async _createToolbarPathAction(fileInfo, pathItem){
        const action = document.createElement('div');
        action.classList.add('action');

        if (fileInfo.isDir){

            const fileDir = this._files.findPath(fileInfo.path);

            if (fileDir && fileDir instanceof FileDir){
                const childInfo = fileDir.childInfo;

                {
                    const dirs = document.createElement('ul');
                    const files = document.createElement('ul');

                    childInfo.forEach((ci) => {
                        const childItem = document.createElement('li');
                        childItem.innerText = ci.display;
                        childItem.addEventListener('click', () => this.showPath(ci, true));
                        (ci.isDir ? dirs : files).appendChild(childItem);
                    });

                    if (dirs.childElementCount > 0) action.appendChild(dirs);
                    if (files.childElementCount > 0) action.appendChild(files);
                }

                const create = document.createElement('ul');
                create.appendChild(this._createAddAction(fileInfo));
                if (create.childElementCount > 0) action.appendChild(create);

                pathItem.appendChild(action);
            }

        } else {

            const actions = document.createElement('ul');

            if (fileInfo.isDeletable) {
                const deleteFile = document.createElement('li');
                deleteFile.classList.add('is-action-delete');
                deleteFile.innerText = 'Delete';
                deleteFile.addEventListener('click', ()=>this._files.deleteFile(fileInfo));
                actions.appendChild(deleteFile);
            }

            if (actions.childElementCount > 0) {
                action.appendChild(actions);

                pathItem.appendChild(action);
            }

        }
    }

    async showPath(fileInfo, focus){
        if (!(fileInfo instanceof FileInfo)) throw '!FileInfo:' + fileInfo;

        const existingPath = this.querySelector('ide-toolbar-path');

        const newPath = document.createElement('ide-toolbar-path');
        //newPath.setAttribute('data-file-path', fileInfo.path);

        {
            const rootItem = document.createElement('ide-toolbar-path-item');
            rootItem.classList.add('has-action', 'is-app-name');
            rootItem.setAttribute('tabindex', DOCUMENT_ORDER_TAB_INDEX);
            rootItem.innerText = this._appName;
            //rootItem._fileInfo = fileInfo;
            newPath.appendChild(rootItem);

            this._createToolbarPathAction(this._files.rootDir.info, rootItem);
        }

        const partsInfo = fileInfo.partsInfo;

        let lastPathItem = null;
        let lastFileInfo = null;

        partsInfo.forEach((partInfo)=>{
            const newPathItem = document.createElement('ide-toolbar-path-item');

            newPathItem.classList.add('has-action');
            newPathItem.setAttribute('tabindex', DOCUMENT_ORDER_TAB_INDEX);
            newPathItem.innerText = partInfo.display;

            this._createToolbarPathAction(partInfo, newPathItem);

            newPath.appendChild(newPathItem);

            lastPathItem = newPathItem;
            lastFileInfo = partInfo;
        });

        if (fileInfo.isDir){
            // This is a way to make add actions more obvious.
            // Do not update "lastX" variables in this case.
            const addActionPathItem = document.createElement('ide-toolbar-path-item');
            addActionPathItem.classList.add('has-action', 'is-action-add');
            addActionPathItem.setAttribute('tabindex', DOCUMENT_ORDER_TAB_INDEX);
            addActionPathItem.innerText = ' ';
            addActionPathItem.addEventListener('click', ()=>this._addAction(fileInfo));
            newPath.appendChild(addActionPathItem);
        }

        existingPath.replaceWith(newPath);

        if (focus && lastFileInfo && lastPathItem){
            if (lastFileInfo.isDir){
                lastPathItem.focus();
            } else{
                this.openFile(lastFileInfo);
            }
        }
    }

    get _files(){
        return this.querySelector('ide-files');
    }

    ready(){
        this._sessionBase = this.getAttribute("data-session-base-href");
        this._sessionApiBase = this.getAttribute("data-session-base-api-href");

        {
            const sel = 'ide-toolbar-item.is-notifications .action';
            const notifications = this.querySelector(sel);
            if (!notifications) throw '!' + sel;
            this._notifications = new Notifications(notifications);
        }

        this._files.refresh();
        this._loadAppMeta();

        this.removeAttribute('init');
    }

    closeFile(fileInfo){
        const existing = this.workspace.findViewTab(fileInfo.id);

        if (existing) existing.close();
    }

    /**
     * @param fileInfo
     */
    openFile(fileInfo){
        const work = this.workspace;
        const id = 'view-' + fileInfo.id;
        const existing = work.findViewTab(id);

        if (existing) {
            existing.activate();
            return;
        }

        const view = new View(fileInfo);
        const tab = new ViewTab(view, fileInfo);

        work.addViewTab(tab);

        //return view;
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

    get sessionApiBase(){
        return this.root.sessionApiBase;
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

class Toolbar extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ide-toolbar', Toolbar);

class ToolbarLeft extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ide-toolbar-left', ToolbarLeft);
class ToolbarRight extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ide-toolbar-right', ToolbarRight);
class ToolbarItem extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ide-toolbar-item', ToolbarItem);

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
