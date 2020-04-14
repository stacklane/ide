'use strict';

/**
 * Only contains {SourceFile#isFile}
 */
class Source{

    static empty(){
        return new Source([]);
    }

    static fromJsonApi(jsonArray){
        const files = [];

        for (let i = 0; i < jsonArray.length; i++) {
            const f = SourceFile.of(jsonArray[i]);
            if (!f.isFile) throw '!SourceFile#isFile';
            files.push(f);
        }

        return new Source(files);
    }

    /**
     * Use factory methods instead.
     */
    constructor(fileInfoArray){
        this._files = fileInfoArray;
        this._listeners = [];
    }

    /**
     * Array of {SourceFile#isFile}
     */
    get files(){
        return this._files;
    }

    /**
     * Direct children of any type: {SourceFile#isFile} and {SourceFile#isDir}.
     */
    children(parent){
        if (parent.isFile) return [];

        const out = [];
        const addedDirs = new Set();

        this._files.forEach((file)=>{
            if (file.parentDir.path === parent.path){
                out.push(file);
            } else if (file.path.startsWith(parent.path)){
                // Materialize child directories
                // e.g. all result in '/one/three/'
                // /one/three/four.txt
                // /one/three/five.txt
                // /one/three/other/thing.txt
                const dirs = file.dirs;
                if (dirs.length > 1) {
                    const parentDir = dirs[parent.parts.length + 1];
                    if (!addedDirs.has(parentDir.path)) {
                        addedDirs.add(parentDir.path);
                        out.push(parentDir);
                    }
                }
            }
        });

        out.sort((a, b) => a.compareTo(b));

        return out;
    }

    addListener(listener){
        this._listeners.push(listener);
    }

    watchChanges(changeSet){
        // init current state
        changeSet.all().forEach((change)=>this._applyChange(change));

        // listen for future changes
        changeSet.addListener((change)=>{
            this._applyChange(change);
            this._listeners.forEach(listener=>listener(change));
        });

        return this;
    }

    _applyChange(change){
        if (change.type === SourceChange.DELETE){
            this._files = this._files.filter(file=>file.path !== change.file.path);
        } else if (change.type === SourceChange.CREATE){
            this._files.push(change.file);
        } else {
            console.error('unhandled change: ' + change);
        }
    }
}