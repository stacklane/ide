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
    }

    connectedCallback(){
        this.setAttribute('role', 'tree');
        this._render();
    }

    _addRootDir(name){
        for (let i = 0; i < this.childElementCount; i++){
            let c = this.children.item(i);
            if (c instanceof FileDir && c.name === name) return c;
        }

        let rootDir = new FileDir(name);
        this.appendChild(rootDir);
        return rootDir;
    }

    add(file){
        const parts = file.path.split('/');

        let lastDir = null;

        for (let i = 1 /* skip root */; i < parts.length; i++){
            const last = i === parts.length - 1;

            if (last){
                let fileItem = new FileItem(file.id, parts[i]);
                if (lastDir) {
                    lastDir.addItem(fileItem);
                } else {
                    this.appendChild(fileItem);
                }
            } else if (lastDir){
                lastDir = lastDir.addDir(parts[i]);
            } else {
                lastDir = this._addRootDir(parts[i]);
            }
        }
    }

    _render(){
        this.loading = true;
        let thiz = this;

        fetch(this.sessionBase + '/api/files')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                let json = data.data;

                for(let i = 0; i < json.length; i++) this.add(json[i]);

                new TreeLinks(thiz).init();

                thiz.loading = false;

                thiz.classList.add('render-fix' /* safari not repainting */);
            });
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
    constructor(label) {
        super();
        this._label = label;

        this.setAttribute('role', 'treeitem');
        this.expanded = false;

        let labelElement = document.createElement('span');
        labelElement.appendChild(new FileDirToggle(this));
        let ll = document.createElement('span');
        ll.innerText = this._label;
        labelElement.appendChild(ll);
        this.appendChild(labelElement);

        let d = document.createElement('div');
        d.setAttribute('role', 'group');
        this._group = d;
        this.appendChild(d);
    }

    /**
     * Add FileDir or return existing.
     */
    addDir(name){
        const group = this._group;

        for (let i = 0; i < group.children.length; i++){
            let c = group.children.item(i);
            if (c instanceof FileDir && c.name === name) return;
        }

        let newDir = new FileDir(name);
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
        const that = this;

        const handle = function(e){
            that.toggle();
            e.stopPropagation();
            e.preventDefault();
        };

        this.addEventListener(FILE_NODE_CLICK_EVENT, handle);
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
window.customElements.define('ide-files', Files);
window.customElements.define('ide-file-dir', FileDir);
window.customElements.define('ide-file-dir-toggle', FileDirToggle);
window.customElements.define('ide-file-item', FileItem);