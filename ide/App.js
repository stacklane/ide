'use strict';

// https://joshtronic.com/2015/04/19/handling-click-and-touch-events-on-the-same-element/
const TOUCH_DEVICE = 'ontouchstart' in document.documentElement;
const FILE_NODE_CLICK_EVENT = TOUCH_DEVICE ? 'touchstart' : 'dblclick';
const DOCUMENT_ORDER_TAB_INDEX = '0';

class App extends HTMLElement {
    constructor() {
        super();
    }

    get sessionId(){
        return this._sessionId;
    }

    get sessionBase(){
        return this._sessionBase;
    }

    get sessionApiBase(){
        return this._sessionApiBase;
    }

    get sourceChangeSet(){
        return this._changeSet;
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
        CreateDialog(fileInfoContext, this._files.source).modal();
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
        if (!(fileInfo instanceof SourceFile)) throw '!SourceFile:' + fileInfo;

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

    save(){
        Array.from(this._tabs.children)
            .filter(e=>e instanceof UITab)
            .forEach((tab)=>tab.view.save());
    }

    get _files(){
        return this.querySelector('ide-files');
    }

    closeFile(fileInfo){
        const existing = this.findFileViewTab(fileInfo);

        if (existing) existing.close();
    }

    /**
     * @param fileInfo
     */
    openFile(fileInfo){
        const existing = this.findFileViewTab(fileInfo);

        if (existing) {
            existing.activate();
            return;
        }

        const view = new View(fileInfo);

        this.addViewTab(view.createTab());
    }

    findFileViewTab(fileInfo){
        return UITab.find(this._tabs, View.CreateId(fileInfo));
    }

    addViewTab(viewTab){
        viewTab.loading = true;
        viewTab.view.loading = true;

        this._tabs.appendChild(viewTab);
        this._workspace.appendChild(viewTab.view);

        viewTab.activate();

        viewTab.view.load().then(()=>{
            viewTab.loading = false;
            viewTab.view.loading = false;
        });
    }

    ready(){
        this._workspace = this.querySelector('.ide-workspace');
        this._tabs = this._workspace.querySelector('ide-toolbar > ide-toolbar-left');
        this._sessionId = this.getAttribute("data-session-id");
        this._sessionBase = this.getAttribute("data-session-base-href");
        this._sessionApiBase = this.getAttribute("data-session-base-api-href");
        this._autoSave = setInterval(()=>this.save(), 20000);

        const that = this;
        window.addEventListener(SourceChangeSet.SIZE_CHANGE, function(event){
            if (event.detail.sessionId !== that._sessionId) return;
            const stats = event.detail.stats;
            let n = '';
            if (stats.create) n += '<span class="is-create">' + stats.create + '</span>';
            if (stats.update) n += '<span class="is-update">' + stats.update + '</span>';
            if (stats.delete) n += '<span class="is-delete">' + stats.delete + '</span>';
            if (n.length > 0) n = '<span class="is-changeset-stats-group">' + n + '</span>';
            that.querySelector('.is-changeset-stats').innerHTML = n;
        });

        this._files.refresh();
        this._loadAppMeta();

        this._changeSet = SourceChangeSet.fromLocalStorage(this._sessionId);

        this.removeAttribute('init');
    }

}
window.customElements.define('ide-app', App);

/**
 * Superclass which provides simple environment related utilities.
 */
class IDEComponent extends HTMLElement{
    constructor() {
        super();
    }

    get sessionId(){
        return this.root.sessionId;
    }

    get sessionBase(){
        return this.root.sessionBase;
    }

    get sessionApiBase(){
        return this.root.sessionApiBase;
    }

    get root(){
        if (this._root) return this._root;
        this._root = this.closest('ide-app');
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
}


