'use strict';
class RootView extends ViewContent{
    constructor(sourceContext) {
        super(sourceContext);
    }

    receive(){
        // TODO display as e.g "🎛 Manifest"

        // TODO if settings aren't defined then, create them on click...
        //     in other words, show ones that aren't actually there

        // TODO in fact we should probably order those in a custom way..

        // TODO and to me that implies these "Settings" files don't go in root path bar either.
        //     make them only accessible from home/root view.

        const children = this.context.source.children(this.context.file);

        const settings = Elements.div().classes('is-file-grid').create();
        const dirs = Elements.div().classes('is-file-grid').create();
        const files = Elements.div().classes('is-file-grid').create();

        {
            const newFile = Elements.div().classes('is-file-item').text('New...').create();
            files.appendChild(newFile);

            // TODO WRONG!  This should have a 'new icon' to right of files header

            // TODO clickable through App
        }

        children.forEach((child)=>{
            const item = Elements.div().classes('is-file-item').text(child.display).create();
            if (child.isSettings){
                settings.appendChild(item);
                item.addEventListener('click', ()=>this.app.showView(child));
            } else if (child.isDir){
                dirs.appendChild(item);
                item.addEventListener('click', ()=>this.app.showPath(child, true));
            } else {
                files.appendChild(item);
                item.addEventListener('click', ()=>this.app.showView(child));
            }
        });

        if (settings.childElementCount){
            this.appendChild(Elements.h2().text('Settings').create());
            this.appendChild(settings);
        }
        if (dirs.childElementCount) {
            this.appendChild(Elements.h2().text('Folders').create());
            this.appendChild(dirs);
        }
        if (files.childElementCount) {
            this.appendChild(Elements.h2().text('Files').create());
            this.appendChild(files);
        }

        return Promise.resolve();
    }

}
window.customElements.define('ide-view-root', RootView);