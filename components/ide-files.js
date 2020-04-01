// https://joshtronic.com/2015/04/19/handling-click-and-touch-events-on-the-same-element/
const TOUCH_DEVICE = 'ontouchstart' in document.documentElement;
const FILE_NODE_CLICK_EVENT = TOUCH_DEVICE ? 'touchstart' : 'dblclick';

class FileLink extends IDEComponent{
    constructor(fileId, fileName) {
        super();

        this.fileId = fileId;
        this.fileName = fileName;
    }

    connectedCallback(){
        this.innerText = this.fileName;

        const that = this;
        this.addEventListener('click', ()=>that.root.openFile({id: that.fileId, name: that.fileName}));
    }
}

/**
 * https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
 */
class Files extends IDEComponent {
    constructor() {
        super();
        this.setAttribute('role', 'tree');
        this._root = new FileDir(null, null);
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

                for(let i = 0; i < json.length; i++) this.add(json[i]);

                new TreeLinks(thiz).init();

                thiz.loading = false;

                thiz.classList.add('render-fix' /* safari not repainting */);
            });
    }

    add(file){
        const parts = file.dir.split('/');

        let lastDir = this._root;

        for (let i = 1 /* skip first slash */;
             i < parts.length - 1 /* skip last slash */;
             i++){
            lastDir = lastDir.addDir(parts[i]);
        }

        let fileItem = new FileItem(file.id, file.name);
        lastDir.addItem(fileItem);

        return fileItem;
    }
}

class FileDirToggle extends HTMLElement{
    constructor(fileDir) {
        super();
        this._fileDir = fileDir;
    }

    connectedCallback(){
        const that = this;
        this.addEventListener('click', function(event){
            //?
            // only process click events that directly happened on this treeitem
            //if (event.target !== this.domNode && event.target !== this.domNode.firstElementChild) {
            //    return;
            //}
            that._fileDir.toggle();
            event.stopPropagation();
            event.preventDefault();
        });
    }
}

class FileDir extends IDEComponent{
    constructor(label, expandable) {
        super();
        this._label = label;
        this._expandable = expandable; // aka user-expandable

        this.setAttribute('role', 'treeitem');

        this.expanded = !this._expandable; // expanded now, if not user-expandable

        if (this._label){
            let labelElement = document.createElement('span');
            if (this._expandable) labelElement.appendChild(new FileDirToggle(this));
            let ll = document.createElement('span');
            ll.innerText = this._label;
            labelElement.appendChild(ll);
            this.appendChild(labelElement);
        }

        let d = document.createElement('div');
        d.setAttribute('role', 'group');
        this._group = d;
        this.appendChild(d);
    }

    /**
     * Add nested FileDir, or return existing.
     */
    addDir(name){
        const group = this._group;

        for (let i = 0; i < group.children.length; i++){
            let c = group.children.item(i);
            if (c instanceof FileDir && c.name === name) return c;
        }

        let newDir = new FileDir(name, true);
        group.appendChild(newDir);
        return newDir;
    }

    addItem(fileItem){
        if (!(fileItem instanceof FileItem)) throw '!FileItem';
        this._group.appendChild(fileItem);
    }

    get name(){
        return this._label;
    }

    toggle(){
        this.expanded = !this.expanded;
    }

    get expanded(){
        return this.getAttribute('aria-expanded')==='true';
    }

    set expanded(val){
        this.setAttribute('aria-expanded', (val === true || val === 'true') ? 'true' : 'false');
    }

    connectedCallback(){
        if (this._expandable) {
            const that = this;

            const toggleEvent = function (e) {
                that.toggle();
                e.stopPropagation();
                e.preventDefault();
            };

            this.addEventListener(FILE_NODE_CLICK_EVENT, toggleEvent);
        }
    }
}

class FileItem extends IDEComponent{
    constructor(fileId, fileName) {
        super();
        this._fileId = fileId;
        this._fileName = fileName;

        this.innerText = this._fileName;
        this.setAttribute('role', 'treeitem');
    }

    get name(){
        return this._fileName;
    }

    open(){
        const that = this;
        that.root.openFile({id: that._fileId, name: that._fileName});
    }

    connectedCallback(){
        const that = this;
        const handleOpen = function(e){
            that.open();
            e.stopPropagation();
            e.preventDefault();
        };

        this.addEventListener(FILE_NODE_CLICK_EVENT, handleOpen);
        this.addEventListener( 'keydown', function(e){
            if (e.code === 'Enter') handleOpen(e);
        });
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
        currentItem.domNode.setAttribute('aria-expanded', true);
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
        groupTreeitem.domNode.setAttribute('aria-expanded', false);
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
            if (parent.getAttribute('aria-expanded') === 'false') {
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
    this.label = node.textContent.trim();
    this.stopDefaultClick = false;

    if (node.getAttribute('aria-label')) {
        this.label = node.getAttribute('aria-label').trim();
    }

    this.isExpandable = false;
    this.isVisible = false;
    this.inGroup = false;

    if (group) {
        this.inGroup = true;
    }

    var elem = node.firstElementChild;

    while (elem) {

        if (elem.getAttribute('role') === 'group') {
            this.isExpandable = true;
            break;
        }

        elem = elem.nextElementSibling;
    }

    this.keyCode = Object.freeze({
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
};

TreeitemLink.prototype.init = function () {
    this.domNode.tabIndex = -1;

    if (this.domNode.getAttribute('role') !== 'treeitem') throw '!treeitem';

    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    //this.domNode.addEventListener('click', this.handleClick.bind(this));
    this.domNode.addEventListener('focus', this.handleFocus.bind(this));
    this.domNode.addEventListener('blur', this.handleBlur.bind(this));

    // use :hover and CSS classes as needed:
    //if (this.isExpandable) {
    //    this.domNode.firstElementChild.addEventListener('mouseover', this.handleMouseOver.bind(this));
    //    this.domNode.firstElementChild.addEventListener('mouseout', this.handleMouseOut.bind(this));
    //} else {
    //    this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
    //   this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));
    // }
};

/* any ARIA reason not use :hover?
TreeitemLink.prototype.handleMouseOver = function (event) {
    event.currentTarget.classList.add('hover');
};

TreeitemLink.prototype.handleMouseOut = function (event) {
    event.currentTarget.classList.remove('hover');
};*/

TreeitemLink.prototype.isExpanded = function () {

    if (this.isExpandable) {
        return this.domNode.getAttribute('aria-expanded') === 'true';
    }

    return false;

};

/* EVENT HANDLERS */

TreeitemLink.prototype.handleKeydown = function (event) {
    var tgt = event.currentTarget,
        flag = false,
        char = event.key,
        clickEvent;

    function isPrintableCharacter (str) {
        return str.length === 1 && str.match(/\S/);
    }

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

    this.stopDefaultClick = false;

    if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    if (event.shift) {
        if (event.keyCode === this.keyCode.SPACE ||
            event.keyCode === this.keyCode.RETURN) {
            event.stopPropagation();
            this.stopDefaultClick = true;
        }
        else {
            if (isPrintableCharacter(char)) {
                printableCharacter(this);
            }
        }
    } else {
        switch (event.keyCode) {
            case this.keyCode.SPACE:
            case this.keyCode.RETURN:
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
                    this.stopDefaultClick = true;
                }
                break;

            case this.keyCode.UP:
                this.tree.setFocusToPreviousItem(this);
                flag = true;
                break;

            case this.keyCode.DOWN:
                this.tree.setFocusToNextItem(this);
                flag = true;
                break;

            case this.keyCode.RIGHT:
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

            case this.keyCode.LEFT:
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

            case this.keyCode.HOME:
                this.tree.setFocusToFirstItem();
                flag = true;
                break;

            case this.keyCode.END:
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

/*
TreeitemLink.prototype.handleClick = function (event) {

    // only process click events that directly happened on this treeitem
    if (event.target !== this.domNode && event.target !== this.domNode.firstElementChild) {
        return;
    }

    if (this.isExpandable) {
        if (this.isExpanded()) {
            this.tree.collapseTreeitem(this);
        }
        else {
            this.tree.expandTreeitem(this);
        }
        event.stopPropagation();
    }
};*/

TreeitemLink.prototype.handleFocus = function (event) {
    var node = this.domNode;
    if (this.isExpandable) {
        node = node.firstElementChild;
    }
    node.classList.add('focus');
};

TreeitemLink.prototype.handleBlur = function (event) {
    var node = this.domNode;
    if (this.isExpandable) {
        node = node.firstElementChild;
    }
    node.classList.remove('focus');
};


