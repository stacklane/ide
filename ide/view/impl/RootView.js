'use strict';
class RootView extends ViewContent{
    constructor(sourceContext) {
        super(sourceContext);
    }

    receive(){

        // TODO if settings aren't defined then, create them on click...
        //     in other words, show ones that aren't actually there

        // TODO in fact we should probably order those in a custom way..

        const children = this.context.source.childFiles(this.context.file);

        const dirs = Elements.div().classes('is-file-grid').create();
        const files = Elements.div().classes('is-file-grid').create();

        children.forEach((child)=>{
            const item = Elements.div().classes('is-file-item').text(child.display).create();
            if (child.isSettings){
                // Handled below
            } else if (child.isDir){
                dirs.appendChild(item);
                item.addEventListener('click', ()=>this.app.showPath(child, true));
            } else {
                files.appendChild(item);
                item.addEventListener('click', ()=>this.app.showView(child));
            }
        });

        {
            const settings = Elements.div().classes('is-file-grid').create();

            this.appendChild(Elements.h2().text('Settings').create());

            // TODO these should be opene existing OR create as needed....

            const manifest = Elements.div().classes('is-file-item')
                                    .text(SourceFile.of('/🎛.yaml').display)
                                    .create();

            const properties = Elements.div().classes('is-file-item')
                .text(SourceFile.of('/🎨.scss').display)
                .create();

            const models = Elements.div().classes('is-file-item')
                .text(SourceFile.of('/📦/').display)
                .create();

            settings.appendChild(manifest);
            settings.appendChild(properties);
            settings.appendChild(models);

            this.appendChild(settings);
        }

        if (dirs.childElementCount) {
            this.appendChild(Elements.h2().text('Folders').create());
            this.appendChild(dirs);
        }

        {
            const h2 = Elements.h2().html('<span>Files</span>').create();
            const newIcon = new UIIcon('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>')
                .em().classes('is-green');
            newIcon.addEventListener('click', ()=>this.app.showCreatorDialog(SourceFile.root()));
            h2.appendChild(newIcon);
            this.appendChild(h2);
            this.appendChild(files);
        }

        return Promise.resolve();
    }

}
window.customElements.define('ide-view-root', RootView);