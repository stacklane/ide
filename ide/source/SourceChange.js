class SourceChange{

    static get MOVE() {return "move"};
    static get CREATE() {return "create"};
    static get DELETE() {return "delete"};
    static get UPDATE() {return "update"};

    constructor(change, sourceFile) {
        this._change = change;
        this._sourceFile = sourceFile ? sourceFile : SourceFile.of(this._change.file);
    }

    get type(){
        return this._change.type;
    }

    get file(){
        return this._sourceFile;
    }

}