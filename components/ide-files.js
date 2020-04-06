// https://joshtronic.com/2015/04/19/handling-click-and-touch-events-on-the-same-element/
const TOUCH_DEVICE = 'ontouchstart' in document.documentElement;
const FILE_NODE_CLICK_EVENT = TOUCH_DEVICE ? 'touchstart' : 'dblclick';

const MOUSE_OVER = function(e){
    e.currentTarget.classList.add('hover');
    e.stopPropagation();
};
const MOUSE_OUT = function(e){
    e.currentTarget.classList.remove('hover');
    e.stopPropagation();
};

const KEY_CODE = Object.freeze({
    RETURN: 13,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
});

const isPrintableCharacter = (str)=>{
    return str.length === 1 && str.match(/\S/);
};

class FileLink extends IDEComponent{
    constructor(fileId, fileName, filePath) {
        super();

        this.fileId = fileId;
        this.fileName = fileName;
        this._path = filePath;

        this.innerText = this.fileName;

        const that = this;
        this.addEventListener('click', ()=>that.root.openFile({id: that.fileId, name: that.fileName, path: that._path}));
    }
}

/**
 * https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
 */
class Files extends IDEComponent {
    constructor() {
        super();
        this.setAttribute('role', 'tree');
        this._root = new FileDir("/", false);
        this.appendChild(this._root);
    }

    refresh(){
        const thiz = this;

        this.loading = true;

        return fetch(this.sessionBase + '/api/files')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                const json = data.data;

                for (let i = 0; i < json.length; i++) this._addFileObject(json[i]);

                new TreeLinks(thiz).init();

                thiz.loading = false;

                thiz.classList.add('render-fix' /* safari not repainting */);
            });
    }

    _addFileObject(fileObject){
        const file = new FileInfo(fileObject);

        const dirParts = file.dirParts;

        let lastDir = this._root;

        for (let i = 0; i < dirParts.length; i++){
            lastDir = lastDir.addDir(dirParts[i]);
        }

        lastDir.addItem(file);
    }
}

class FileDirToggle extends HTMLElement{
    constructor(fileDir) {
        super();
        this._fileDir = fileDir;
        const that = this;
        this.addEventListener('click', function(event){
            that._fileDir.toggle();
            event.stopPropagation();
            event.preventDefault();
        });
    }
}

class FileDir extends IDEComponent{
    constructor(dirInfo, expandable) {
        super();

        if (dirInfo === '/'){
            this._info = null;
            this._name = '';
            this._path = '/';
        } else if (dirInfo instanceof FileInfo){
            if (!dirInfo.isDir) throw dirInfo;
            this._info = dirInfo;
            this._name = dirInfo.name;
            this._path = dirInfo.path;
        } else {
            throw dirInfo + '';
        }

        this._expandable = expandable; // AKA "user expandable"

        this.setAttribute('aria-expanded', 'false');
        this.setAttribute('role', 'treeitem');

        this.expanded = !this._expandable; // expanded now, if not user-expandable

        const that = this;

        if (this._name){
            const labelControl = document.createElement('span');
            if (this.isExpandable()) {
                labelControl.appendChild(new FileDirToggle(this));
                this.addEventListener('focus', ()=>{
                    labelControl.classList.add('focus');
                    that.root.showPath(that._info);
                });
                this.addEventListener('blur', ()=>labelControl.classList.remove('focus'));
                labelControl.addEventListener('mouseover', MOUSE_OVER);
                labelControl.addEventListener('mouseout', MOUSE_OUT);
            }
            const labelText = document.createElement('span');
            labelText.innerText = this._name;
            labelControl.appendChild(labelText);
            this.appendChild(labelControl);
        }

        const groupDiv = document.createElement('div');
        groupDiv.setAttribute('role', 'group');
        this._group = groupDiv;
        this.appendChild(groupDiv);

        if (this.isExpandable()) {
            const toggleEvent = function (e) {
                that.toggle();
                e.stopPropagation();
                e.preventDefault();
            };

            this.addEventListener(FILE_NODE_CLICK_EVENT, toggleEvent);
        }
    }

    get childDirs(){
        return Array.from(this._group.children).filter((c)=>c instanceof FileDir);
    }

    /**
     * Add nested FileDir, or return existing.
     */
    addDir(name){
        const group = this._group;

        const existing = this.childDirs.find((dir)=>dir.name === name);
        if (existing) return existing;

        const newDirInfo = new FileInfo(this._path + name + '/');

        const newDir = new FileDir(newDirInfo, true);

        group.appendChild(newDir);

        this._sort();

        return newDir;
    }

    _sort(){
        const group = this._group;
        Array.from(group.children)
            .filter((el)=>(el instanceof FileItem || el instanceof FileDir))
            .sort((a, b) => a.compareTo(b))
            .forEach(el => group.appendChild(el));
    }

    toString(){
        return 'FileDir[' + this._path + ']';
    }

    compareTo(fileOrDir){
        if (fileOrDir instanceof FileItem){
            return -1;
        } else if (fileOrDir instanceof FileDir){
            return this.path.localeCompare(fileOrDir.path);
        } else {
            return -1;
        }
    }

    addItem(fileInfo){
        const fileItem = new FileItem(fileInfo);
        this._group.appendChild(fileItem);
        this._sort();
    }

    isExpanded(){
        return this.expanded;
    }

    isExpandable(){
        return this._expandable;
    }

    get dirInfo(){
        return this._info;
    }

    get path(){
        return this._path;
    }

    get name(){
        return this._name;
    }

    toggle(){
        this.expanded = !this.expanded;
    }

    collapse(){
        this.expanded = false;
    }

    expand(){
        this.expanded = true;
    }

    get expanded(){
        return this.getAttribute('aria-expanded')==='true';
    }

    set expanded(val){
        if (val === this.expanded) return;

        this.setAttribute('aria-expanded', (val === true || val === 'true') ? 'true' : 'false');

        // When collapsing this FileDir, then also collapse children (which will recursively keep collapsing):
        if (!val) this.childDirs.forEach((child)=>child.collapse());
    }
}

class FileItem extends IDEComponent{
    constructor(fileInfo) {
        super();

        this._file = fileInfo;

        this.innerText = this._file.name;
        this.setAttribute('role', 'treeitem');

        {
            const that = this;
            const handleOpen = function (e) {
                that.open();
                e.stopPropagation();
                e.preventDefault();
            };

            this.addEventListener(FILE_NODE_CLICK_EVENT, handleOpen);
            this.addEventListener('keydown', function (e) {
                if (e.code === 'Enter') handleOpen(e);
            });

            this.addEventListener('focus', ()=>that.showFocus());
            this.addEventListener('blur', ()=>that.classList.remove('focus'));
            this.addEventListener('mouseover',  MOUSE_OVER);
            this.addEventListener('mouseout', MOUSE_OUT);
        }
    }

    showFocus(){
        this.classList.add('focus');
        this.root.showPath(this._file);
    }

    toString(){
        return 'FileItem[' + this.path + ']';
    }

    isExpanded(){
        return false; // because leaf node
    }

    isExpandable(){
        return false; // because leaf node
    }

    get fileInfo(){
        return this._file;
    }

    get path(){
        return this._file._path;
    }

    get name(){
        return this._file._name;
    }

    open(){
        this.root.openFile(this._file);
    }

    compareTo(fileOrDir){
        if (fileOrDir instanceof FileItem){
            return this.path.localeCompare(fileOrDir.path);
        } else if (fileOrDir instanceof FileDir){
            return 1;
        } else {
            return 1;
        }
    }

}

//////

window.customElements.define('ide-file-link', FileLink);
window.customElements.define('ide-file-dir', FileDir);
window.customElements.define('ide-file-dir-toggle', FileDirToggle);
window.customElements.define('ide-file-item', FileItem);
window.customElements.define('ide-files', Files);

//////////////


/**
 * Adapted from:
 * https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
 *
 * TODO relocate to classes
 */

var TreeLinks = function (node) {
    this.domNode = node;

    this.treeitems = [];
    this.firstChars = [];

    this.firstTreeitem = null;
    this.lastTreeitem = null;
};

TreeLinks.prototype.init = function () {

    function findTreeitems (node, tree, group) {
        let elem = node.firstElementChild;
        let ti = group;

        while (elem) {
            if (elem.tagName.toLowerCase() === 'ide-file-dir' ||
                elem.tagName.toLowerCase() === 'ide-file-item') {
                ti = new TreeitemLink(elem, tree, group);
                ti.init();
                tree.treeitems.push(ti);
                tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
            }

            if (elem.firstElementChild) {
                findTreeitems(elem, tree, ti);
            }

            elem = elem.nextElementSibling;
        }
    }

    findTreeitems(this.domNode, this, false);

    this.updateVisibleTreeitems();

    this.firstTreeitem.domNode.tabIndex = 0;
};

TreeLinks.prototype.setFocusToItem = function (treeitem) {

    for (var i = 0; i < this.treeitems.length; i++) {
        var ti = this.treeitems[i];

        if (ti === treeitem) {
            ti.domNode.tabIndex = 0;
            ti.domNode.focus();
        }
        else {
            ti.domNode.tabIndex = -1;
        }
    }

};

TreeLinks.prototype.setFocusToNextItem = function (currentItem) {

    var nextItem = false;

    for (var i = (this.treeitems.length - 1); i >= 0; i--) {
        var ti = this.treeitems[i];
        if (ti === currentItem) {
            break;
        }
        if (ti.isVisible) {
            nextItem = ti;
        }
    }

    if (nextItem) {
        this.setFocusToItem(nextItem);
    }

};

TreeLinks.prototype.setFocusToPreviousItem = function (currentItem) {

    var prevItem = false;

    for (var i = 0; i < this.treeitems.length; i++) {
        var ti = this.treeitems[i];
        if (ti === currentItem) {
            break;
        }
        if (ti.isVisible) {
            prevItem = ti;
        }
    }

    if (prevItem) {
        this.setFocusToItem(prevItem);
    }
};

TreeLinks.prototype.setFocusToParentItem = function (currentItem) {

    if (currentItem.groupTreeitem) {
        this.setFocusToItem(currentItem.groupTreeitem);
    }
};

TreeLinks.prototype.setFocusToFirstItem = function () {
    this.setFocusToItem(this.firstTreeitem);
};

TreeLinks.prototype.setFocusToLastItem = function () {
    this.setFocusToItem(this.lastTreeitem);
};

TreeLinks.prototype.expandTreeitem = function (currentItem) {

    if (currentItem.isExpandable) {
        currentItem.domNode.expand();
        this.updateVisibleTreeitems();
    }

};

TreeLinks.prototype.expandAllSiblingItems = function (currentItem) {
    for (var i = 0; i < this.treeitems.length; i++) {
        var ti = this.treeitems[i];

        if ((ti.groupTreeitem === currentItem.groupTreeitem) && ti.isExpandable) {
            this.expandTreeitem(ti);
        }
    }

};

TreeLinks.prototype.collapseTreeitem = function (currentItem) {

    var groupTreeitem = false;

    if (currentItem.isExpanded()) {
        groupTreeitem = currentItem;
    }
    else {
        groupTreeitem = currentItem.groupTreeitem;
    }

    if (groupTreeitem) {
        groupTreeitem.domNode.collapse();
        this.updateVisibleTreeitems();
        this.setFocusToItem(groupTreeitem);
    }

};

TreeLinks.prototype.updateVisibleTreeitems = function () {

    this.firstTreeitem = this.treeitems[0];

    for (var i = 0; i < this.treeitems.length; i++) {
        var ti = this.treeitems[i];

        var parent = ti.domNode.parentNode;

        ti.isVisible = true;

        while (parent && (parent !== this.domNode)) {
            if (parent instanceof FileDir && !parent.isExpanded()) {
                ti.isVisible = false;
            }
            parent = parent.parentNode;
        }

        if (ti.isVisible) {
            this.lastTreeitem = ti;
        }
    }

};

TreeLinks.prototype.setFocusByFirstCharacter = function (currentItem, char) {
    var start, index, char = char.toLowerCase();

    // Get start index for search based on position of currentItem
    start = this.treeitems.indexOf(currentItem) + 1;
    if (start === this.treeitems.length) {
        start = 0;
    }

    // Check remaining slots in the menu
    index = this.getIndexFirstChars(start, char);

    // If not found in remaining slots, check from beginning
    if (index === -1) {
        index = this.getIndexFirstChars(0, char);
    }

    // If match was found...
    if (index > -1) {
        this.setFocusToItem(this.treeitems[index]);
    }
};

TreeLinks.prototype.getIndexFirstChars = function (startIndex, char) {
    for (var i = startIndex; i < this.firstChars.length; i++) {
        if (this.treeitems[i].isVisible) {
            if (char === this.firstChars[i]) {
                return i;
            }
        }
    }
    return -1;
};


///////////////////////

/**
 * Adapted from:
 *
 * https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
 *
 *  TODO relocate to classes
 */

/*
*   @constructor
*
*   @desc
*       Treeitem object for representing the state and user interactions for a
*       treeItem widget
*
*   @param node
*       An element with the role=tree attribute
*/
var TreeitemLink = function (node, treeObj, group) {

    node.tabIndex = -1;

    this.tree = treeObj;
    this.groupTreeitem = group;
    this.domNode = node;

    if (this.domNode.tagName.toLowerCase() !== 'ide-file-dir' &&
        this.domNode.tagName.toLowerCase() !== 'ide-file-item'){
        throw "! ide-file-dir && ! ide-file-item was " + this.domNode.tagName;
    }

    this.label = node.textContent.trim();

    if (node.getAttribute('aria-label')) {
        this.label = node.getAttribute('aria-label').trim();
    }

    this.isExpandable = this.domNode.isExpandable();
    this.isVisible = false;
    this.inGroup = false;

    if (group) {
        this.inGroup = true;
    }
};

TreeitemLink.prototype.init = function () {
    this.domNode.tabIndex = -1;
    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
};


TreeitemLink.prototype.isExpanded = function () {

    if (this.isExpandable) {
        return this.domNode.isExpanded();
    }

    return false;

};

/* EVENT HANDLERS */

TreeitemLink.prototype.handleKeydown = function (event) {
    let tgt = event.currentTarget,
        flag = false,
        char = event.key,
        clickEvent;

    // Looks strange to retain hover during keyboard navigation:
    this.tree.domNode.querySelectorAll('.hover').forEach((e)=>{
        e.classList.remove('hover');
    });

    function printableCharacter (item) {
        if (char === '*') {
            item.tree.expandAllSiblingItems(item);
            flag = true;
        }
        else {
            if (isPrintableCharacter(char)) {
                item.tree.setFocusByFirstCharacter(item, char);
                flag = true;
            }
        }
    }

    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.shift) {
        if (event.keyCode === KEY_CODE.SPACE ||
            event.keyCode === KEY_CODE.RETURN) {
            event.stopPropagation();
        }
        else {
            if (isPrintableCharacter(char)) {
                printableCharacter(this);
            }
        }
    } else {
        switch (event.keyCode) {
            case KEY_CODE.SPACE:
            case KEY_CODE.RETURN:
                if (this.isExpandable) {
                    if (this.isExpanded()) {
                        this.tree.collapseTreeitem(this);
                    }
                    else {
                        this.tree.expandTreeitem(this);
                    }
                    flag = true;
                }
                else {
                    event.stopPropagation();
                }
                break;

            case KEY_CODE.UP:
                this.tree.setFocusToPreviousItem(this);
                flag = true;
                break;

            case KEY_CODE.DOWN:
                this.tree.setFocusToNextItem(this);
                flag = true;
                break;

            case KEY_CODE.RIGHT:
                if (this.isExpandable) {
                    if (this.isExpanded()) {
                        this.tree.setFocusToNextItem(this);
                    }
                    else {
                        this.tree.expandTreeitem(this);
                    }
                }
                flag = true;
                break;

            case KEY_CODE.LEFT:
                if (this.isExpandable && this.isExpanded()) {
                    this.tree.collapseTreeitem(this);
                    flag = true;
                }
                else {
                    if (this.inGroup) {
                        this.tree.setFocusToParentItem(this);
                        flag = true;
                    }
                }
                break;

            case KEY_CODE.HOME:
                this.tree.setFocusToFirstItem();
                flag = true;
                break;

            case KEY_CODE.END:
                this.tree.setFocusToLastItem();
                flag = true;
                break;

            default:
                if (isPrintableCharacter(char)) {
                    printableCharacter(this);
                }
                break;
        }
    }

    if (flag) {
        event.stopPropagation();
        event.preventDefault();
    }
};

