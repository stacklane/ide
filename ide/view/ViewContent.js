
/**
 * Superclass for SourceFile-based views.
 */
class ViewContent extends HTMLElement{
    static lookup(sourceFile, sourceChangeSet){
        if (sourceFile.isManifest){
            return new ManifestView(sourceFile, sourceChangeSet);
        } else {
            return new EditorView(sourceFile, sourceChangeSet);
        }
    }

    constructor(sourceFile, sourceChangeSet) {
        super();
        this._fileInfo = sourceFile;
        this._sourceChangeSet = sourceChangeSet;
    }

    get sourceChangeSet(){
        return this._sourceChangeSet;
    }

    get sourceFile(){
        return this._fileInfo;
    }

    get fileInfo(){
        return this._fileInfo;
    }

    showFocus(){

    }

    save(){

    }

    receive(response){
        return Promise.reject(new Error('not implemented: #receive'));
    }
}



