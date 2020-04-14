class SourceContext{
    constructor(sourceFile, source, sourceChangeSet) {
        this._file = sourceFile;
        this._source = source;
        this._changes = sourceChangeSet;
    }

    get file(){
        return this._file;
    }

    get source(){
        return this._source;
    }

    get changes(){
        return this._changes;
    }

}