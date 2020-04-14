
/**
 * Superclass for SourceFile-based views.
 */
class ViewContent extends AppComponent{
    static lookup(sourceContext){
        const file = sourceContext.file;
        if (file.isRoot){
            return new RootView(sourceContext);
        } else if (file.isManifest){
            return new ManifestView(sourceContext);
        } else {
            return new EditorView(sourceContext);
        }
    }

    constructor(sourceContext) {
        super();
        this._context = sourceContext;
    }

    get context(){
        return this._context;
    }

    get sourceChangeSet(){
        return this._context.changes;
    }

    get sourceFile(){
        return this._context.file;
    }

    get fileInfo(){
        return this.sourceFile;
    }

    showFocus(){

    }

    save(){

    }

    /**
     * @param {Response}
     */
    receive(response){
        return Promise.reject(new Error('not implemented: #receive'));
    }
}



