/**
 * Structure for holding meta information about both concrete files AND directories.
 */
'use strict';
const _TEXT_EXT = ["md", "js", "yaml", "css", "scss", "html", "svg"];

class SourceFile extends Object{
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
        return 'SourceFile[' + this._path + ']';
    }

    get data(){
        return this._data;
    }

    set data(data){
        this._data = data;
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

    get isText(){
        if (!this.isFile) return false;
        return _TEXT_EXT.includes(this.extension);
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

    get dirInfo(){
        if (this.isDir) return this;
        return new SourceFile(this.dirPath);
    }

    get dirPath(){
        if (this.isDir) return this._path;
        // TODO this probably isn't right
        return '/' + this.dirParts.join('/') + '/';
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
            out.push(new SourceFile(dirPath));
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

    isParameter(){
        return this.name.startsWith("{") && this.name.endsWith("}") &&
            Validation.lowerCaseCamel(this.name.substr(1, this.name.length - 2));
    }

    isUID(){
        return Validation.uid(this.name);
    }

    isSupplierDir(){
        if (this.isFile) return false;
        return '📤' === this.name;
    }

    /**
     * @return {boolean} true if an endpoint is allowed in this directory.
     */
    isEndpointAllowed(){
        if (this.isFile) return false;
        const info = this.partsInfo;
        for (let i = 0; i < info.length; i++){
            if (!info[i].isUID() && !info[i].isParameter()){
                return false;
            }
        }
        return true;
    }

    /**
     * TODO this needs to include private directories.
     */
    isAssetAllowed(){
        if (this.isFile) return false;
        const info = this.partsInfo;
        for (let i = 0; i < info.length; i++){
            if (!info[i].isUID() && !info[i].isParameter()){
                return false;
            }
        }
        return true;
    }
}