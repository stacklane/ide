
/**
 * Structure for holding meta information about both concrete files AND directories.
 */
'use strict';
const _TEXT_EXT = ["md", "js", "yaml", "css", "scss", "html", "svg"];
class SourceFile {

    static root(){
        return new SourceFile('/');
    }

    static of(fileOrPath){
        return new SourceFile(fileOrPath);
    }

    constructor(file) {
        if (file instanceof Object) {

            this._id = file.id;
            this._path = file.path;
            this._version = file.version;

        } else if (typeof file === 'string'){

            this._id = null;
            this._path = file;
            this._version = null;

        } else {

            throw file + '';

        }

        if (!this._path.startsWith('/')) throw this._path;

        this._isDir = this._path.endsWith('/');
        this._isRoot = this._path === '/';

        const p = this._path.split('/');

        if (this._isRoot){
            this._parts = [];
            this._partsInfo = [];
            this._name = '';
        } else if (this.isDir){
            this._parts = p.slice(1, p.length - 1); // skip the root slash and ending slash
            this._name = this._parts[this._parts.length - 1];
        } else {
            this._parts = p.slice(1); // skip the root slash
            this._name = this._parts[this._parts.length - 1];
            this._extension = this._name.substring(this._name.lastIndexOf('.') + 1);
        }

        this._displayParts = this._parts;
        this._display = this._name;
    }

    /**
     * Bare minimum needed to recreate.
     */
    get simple(){
        if (this.isFile){
            return {id: this.id, version: this.version, path: this.path};
        } else {
            return {path: this.path};
        }
    }

    toString(){
        return 'SourceFile[' + this._path + ']';
    }

    get isRoot(){
        return this._isRoot;
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

    get isManifestIcon(){
        return this.path === '/🎛.svg';
    }

    get isProperties(){
        return this.path === '/🎨.yaml';
    }

    get isSettings(){
        return this.isManifest || this.isManifestIcon || this.isProperties;
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

    /**
     * Server side ID
     */
    get id(){
        return this._id;
    }

    get handle(){
        return this._id ? this._id : this._path;
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

    get parentDir(){
        if (this.isRoot) return null;
        const parts = this.parts;
        if (parts.length == 1) return SourceFile.root();
        const dirPath = '/' + parts.slice(0, parts.length -1).join('/') + '/';
        return SourceFile.of(dirPath);
    }

    /**
     * {SourceFile#isDir}'s this {SourceFile} is contained in.
     */
    get dirs(){
        if (this.isRoot) return [];

        const out = [];

        let parentDir = this.parentDir;

        while (parentDir){
            out.unshift(parentDir);
            parentDir = parentDir.parentDir;
        }

        return out;
    }

    get partsInfo(){
        if (this._partsInfo) return this._partsInfo;
        const out = [];
        const parts = this.parts;
        let dirPath = '/';
        for (let i = 0; i < parts.length - 1 /* skip last part, which is THIS object */; i++){
            dirPath += parts[i] + '/';
            out.push(SourceFile.of(dirPath));
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
        return this.isDir && this.name.startsWith("{") && this.name.endsWith("}") &&
            Validation.lowerCaseCamel(this.name.substring(1, this.name.length - 2));
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

    /*
    isChild(parent){
        if (this.isFile){
            return this.dirPath == parent.path;
        } else {
            return this.parentPath === parent.path;
        }
    }*/

    /*
    get parentPath(){
        if (this.isFile){
            return this.dirPath;
        } else if (this.isRoot){
            return null;
        } else {
            return '/' + this.dirParts.slice(0, this.dirParts.length -1).join('/') + '/';
        }
    }*/

    compareTo(sourceFile){
        if (this.path === sourceFile.path) return 0;

        if (this.isDir){
            if (sourceFile.isFile){
                return -1;
            } else if (sourceFile.isDir){
                return this.path.localeCompare(sourceFile.path);
            } else {
                return -1;
            }
        } else {
            if (sourceFile.isFile){
                return this.path.localeCompare(sourceFile.path);
            } else if (sourceFile.isDir){
                return 1;
            } else {
                return 1;
            }
        }
    }
}