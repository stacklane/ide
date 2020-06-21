'use strict';

const _SMALL_HOME_ICON = new UIIcon('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/></svg>')
                                .small()
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

    get source(){
        return this._source;
    }

    get sourceChangeSet(){
        return this._changeSet;
    }

    get api(){
        return this._api;
    }

    async updateAppName(name){
        if (!name) name = 'Project';
        this._appName = name;
    }

    showCreatorDialog(sourceFile){
        CreatorDialog(this.newSourceContext(sourceFile)).modal();
    }

    async showPath(sourceFile, focus){
        this._toolbarUtil.showPath(sourceFile, focus);
    }

    save(){
        Array.from(this._tabs.children)
            .filter(e=>e instanceof UITab)
            .forEach((tab)=>tab.view.save());
    }

    closeFile(fileInfo){
        const existing = this.findFileViewTab(fileInfo);

        if (existing) existing.close();
    }

    newSourceContext(sourceFile){
        return new SourceContext(sourceFile, this.source, this.sourceChangeSet);
    }

    showView(sourceFile){
        const existing = this.findFileViewTab(sourceFile);

        if (existing) {
            existing.activate();
            return;
        }

        let title = null;

        if (sourceFile.isRoot){
            title = _SMALL_HOME_ICON;
        } else {
            title = document.createElement('span');
            title.innerText = sourceFile.display + ' ';
        }

        const view = new View(this.newSourceContext(sourceFile));
        const viewTab = view.createTab(title, !sourceFile.isRoot);

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

    findFileViewTab(fileInfo){
        return UITab.find(this._tabs, View.createId(fileInfo));
    }

    _listenSourceChange(sourceChange){
        if (sourceChange.type === SourceChange.DELETE){
            this.closeFile(sourceChange.file);
        }
    }

    ready(){
        this._workspace = this.querySelector('.ide-workspace');
        this._tabs = this._workspace.querySelector('ui-toolbar > ui-toolbar-left');
        this._sessionId = this.getAttribute("data-session-id");
        this._sessionBase = this.getAttribute("data-session-base-href");
        this._sessionApiBase = this.getAttribute("data-session-base-api-href");
        this._autoSave = setInterval(()=>this.save(), 20000);
        this._changeSet = SourceChangeSet.fromLocalStorage(this._sessionId);
        this._api = new AppApi(this._sessionApiBase);
        this._source = null;
        this._toolbarUtil = new AppToolbarUtil(this);
        this._toolbarUtil.updateChangeStats();

        /**
         * document.title update based on active View
         */
        {
            const that = this;
            that.addEventListener(UITab.ChangeEventName, function(event){
                event.stopPropagation();
                let title = 'Stacklane';
                if (that._appName){
                    title += ' - ' + that._appName;
                    if (event.detail.tab &&
                        event.detail.tab.view instanceof View &&
                        event.detail.tab.view.file) {
                        const file = event.detail.tab.view.file;
                        if (file.parts.length <= 2){
                            title += ' - ' + file.path;
                        } else {
                            title += ' - ../' + file.parts.slice().splice(file.parts.length - 2).join('/');
                        }
                    }
                }
                document.title = title;
            });
        }

        this.api.readMeta()
            .then((json)=>this.updateAppName(json.name))
            .then(()=>this._api.readSource())
            .then((source)=>{
                this._source = source;
                this._source.watchChanges(this._changeSet);
                this._source.addListener((command)=>this._listenSourceChange(command));
            })
            .then(()=>this.showView(SourceFile.root()))
            .then(()=>this.removeAttribute('ui-is-init'));

        /*
        window.addEventListener('hashchange', ()=>{
            console.log(window.location.hash);

            if (window.location.hash.startsWith('#/')){
                const path = decodeURIComponent(window.location.hash.substring(1));
                console.log(path);
                const found = this.source.find(path);
                if (found) this.showView(found);
                console.log('f: ' + found);
            }
        });*/

        {
            const that = this;
            window.addEventListener(SourceChangeSet.CHANGE_EVENT, function (event) {
                if (event.detail.sessionId !== that._sessionId) return;
                that._toolbarUtil.updateChangeStats();
            });
        }
    }

}
window.customElements.define('ide-app', App);

/**
 * Superclass which provides simple environment related utilities.
 */
class AppComponent extends HTMLElement{
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

    get app(){
        return this.root;
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

class Toolbar extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ui-toolbar', Toolbar);

class ToolbarLeft extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ui-toolbar-left', ToolbarLeft);
class ToolbarRight extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ui-toolbar-right', ToolbarRight);
class ToolbarItem extends HTMLElement{
    constructor() {
        super();
    }
}
window.customElements.define('ui-toolbar-item', ToolbarItem);


class AppToolbarUtil{
    constructor(app) {
        this._app = app;
    }

    async updateChangeStats(){
        const stats = this._app.sourceChangeSet.stats();
        let n = '';
        if (stats.create) n += '<span class="is-create">' + stats.create + '</span>';
        if (stats.update) n += '<span class="is-update">' + stats.update + '</span>';
        if (stats.delete) n += '<span class="is-delete">' + stats.delete + '</span>';
        if (n.length > 0) n = '<span class="is-changeset-stats-group">' + n + '</span>';
        this._app.querySelector('ui-toolbar .is-changeset-stats').innerHTML = n;
    }

    showPath(sourceFile, focus){
        if (!(sourceFile instanceof SourceFile)) throw '!SourceFile:' + sourceFile;

        const existingPath = this._app.querySelector('ui-toolbar-path');

        const newPath = document.createElement('ui-toolbar-path');

        {
            const rootItem = document.createElement('ui-toolbar-path-item');
            rootItem.classList.add('has-menu-action', 'is-app-name');
            rootItem.setAttribute('tabindex', '0');
            rootItem.innerText = this._app._appName;
            newPath.appendChild(rootItem);

            this._createToolbarPathMenu(SourceFile.root(), rootItem);
        }

        const partsInfo = sourceFile.partsInfo;

        let lastPathItem = null;
        let lastFileInfo = null;

        partsInfo.forEach((partInfo)=>{
            const newPathItem = document.createElement('ui-toolbar-path-item');

            newPathItem.classList.add('has-menu-action');
            newPathItem.setAttribute('tabindex', '0');
            newPathItem.innerText = partInfo.display;
            newPath.appendChild(newPathItem);

            this._createToolbarPathMenu(partInfo, newPathItem);

            lastPathItem = newPathItem;
            lastFileInfo = partInfo;
        });

        if (sourceFile.isDir){
            // This is a way to make add actions more obvious.
            // Do not update "lastX" variables in this case.
            const addActionPathItem = document.createElement('ui-toolbar-path-item');
            addActionPathItem.classList.add('has-menu-action', 'is-action-add');
            addActionPathItem.setAttribute('tabindex', '0');
            addActionPathItem.innerText = ' ';
            addActionPathItem.addEventListener('click', ()=>this._app.showCreatorDialog(sourceFile));
            newPath.appendChild(addActionPathItem);
        }

        existingPath.replaceWith(newPath);

        if (focus && lastFileInfo && lastPathItem){
            if (lastFileInfo.isDir){
                lastPathItem.focus();
            } else{
                this._app.showView(lastFileInfo);
            }
        }
    }

    async _createToolbarPathMenu(sourceFile, pathItem){
        const menu = document.createElement('div');
        menu.classList.add('menu');

        if (sourceFile.isDir){

            const children = this._app.source.childFiles(sourceFile);

            {
                const dirs = document.createElement('ul');
                const files = document.createElement('ul');

                const includeSettings = !sourceFile.isRoot;  // From #isRoot only, do not include #isSettings

                children
                    .filter(ci=>!ci.isSettings || includeSettings)
                    .forEach((ci) => {
                    const childItem = document.createElement('li');
                    childItem.innerText = ci.display;
                    childItem.addEventListener('click', () => this.showPath(ci, true));
                    (ci.isDir ? dirs : files).appendChild(childItem);
                });

                if (dirs.childElementCount > 0) menu.appendChild(dirs);
                if (files.childElementCount > 0) menu.appendChild(files);
            }

            const create = document.createElement('ul');
            create.appendChild(this._createAddAction(sourceFile));
            if (create.childElementCount > 0) menu.appendChild(create);

            pathItem.appendChild(menu);

        } else {

            const actions = document.createElement('ul');

            if (sourceFile.isDeletable) {
                const deleteFile = document.createElement('li');
                deleteFile.classList.add('is-action-delete');
                deleteFile.innerText = 'Delete';
                deleteFile.addEventListener('click', ()=>{
                    if (confirm('Delete file "' + sourceFile.name + '"?')){
                        this._app.sourceChangeSet.delete(sourceFile);
                    }
                });
                actions.appendChild(deleteFile);
            }

            if (actions.childElementCount > 0) {
                menu.appendChild(actions);
                pathItem.appendChild(menu);
            }

        }
    }

    _createAddAction(fileInfo){
        const add = document.createElement('li');
        add.classList.add('is-action-add');
        add.innerText = 'New...';
        add.addEventListener('click', ()=>this._app.showCreatorDialog(fileInfo));
        return add;
    }
}

class AppApi{
    constructor(apiBase) {
        this._apiBase = apiBase;
    }

    readMeta(){
        return fetch(this._apiBase + '/')
            .then((response) => response.json());
    }

    /**
     * @return {Promise<Source>}
     */
    readSource(){
        return fetch(this._apiBase + '/files')
            .then((response) => {
                return response.json();
            })
            .then((data) => Source.fromJsonApi(data.data));
    }

    /**
     * @param fileId
     * @return {Promise<Response>}
     */
    readData(fileId){
        return fetch(this._apiBase + '/files/' + fileId + '/data');
    }

}


