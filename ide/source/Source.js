'use strict';
class Source{

    static empty(){
        return new Source([]);
    }

    static fromJsonApi(jsonArray){
        const files = [];

        for (let i = 0; i < jsonArray.length; i++) {
            const f = new SourceFile(jsonArray[i]);
            if (!f.isFile) throw '!SourceFile#isFile';
            files.push(f);
        }

        return new Source(files);
    }

    /**
     * Use factory methods
     */
    constructor(fileInfoArray){
        this._files = fileInfoArray;
    }

    /**
     * Array of {SourceFile}
     */
    get files(){
        return this._files;
    }

    applyChanges(changeSet){
        changeSet.all().forEach((change)=>{

            // TODO for CREATE/UPDATE we are probably going to need to use FileInfo#data

            if (change.type === SourceChangeSet.DELETE){
                this._files = this._files.filter((f)=>f.path !== change.path);
            } else {
                throw 'unsupported: ' + change.type;
            }

        });

        return this;
    }

}

