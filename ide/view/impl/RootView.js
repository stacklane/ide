'use strict';
class RootView extends ViewContent {
    constructor(sourceContext) {
        super(sourceContext);
    }

    receive() {

        // TODO if settings aren't defined then, create them on click...
        //     in other words, show ones that aren't actually there

        // TODO in fact we should probably order those in a custom way..

        const list = Elements.div().classes('ui-column', 'has-xl-spacing').create();

        const children = this.context.source.childFiles(this.context.file);

        const dirs = Elements.div().classes('is-file-grid', '--ui-button-has-even-spacing').create();
        const files = Elements.div().classes('is-file-grid', '--ui-button-has-even-spacing').create();

        children.forEach((child) => {
            const item = new UIButton(child.display).contained();

            if (child.isSettings) {
                // Handled below
            } else if (child.isDir) {
                dirs.appendChild(item);
                item.addAction(() => this.app.showPath(child, true));
            } else {
                files.appendChild(item);
                item.addAction(() => this.app.showView(child));
            }
        });

        {
            const settings = Elements.div().classes('is-file-grid', '--ui-button-has-even-spacing').create();

            // TODO these should be opened existing OR create as needed....

            const manifest = new UIButton(SourceFile.of('/🎛.yaml').display).contained();

            const properties = new UIButton(SourceFile.of('/🎨.scss').display).contained();

            const models = new UIButton(SourceFile.of('/📦/').display).contained();

            settings.appendChild(manifest);
            settings.appendChild(properties);
            settings.appendChild(models);

            list.appendChild(
                Elements.section()
                    .classes('has-spacing')
                    .child(Elements.h2().text('Settings'))
                    .child(settings)
                    .create()
            );
        }

        if (dirs.childElementCount) {
            list.appendChild(
                Elements.section()
                    .classes('has-spacing')
                    .child(Elements.h2().text('Folders'))
                    .child(dirs)
                    .create()
            );
        }

        {
            const bar = new UIBar();
            bar.appendChild(Elements.h2().text('Files').create());

            const button = new UIIconButton(UIIcon.plus()).outlined().round();
            button.addAction(() => this.app.showCreatorDialog(SourceFile.root()));

            bar.appendChild(button);

            list.appendChild(
                Elements.section()
                    .classes('has-spacing')
                    .child(bar)
                    .child(files)
                    .create()
            );
        }

        this.appendChild(list);

        return Promise.resolve();
    }

    connectedCallback() {
        this.classList.add('ui-scrollable', 'is-y');
    }
}
window.customElements.define('ide-view-root', RootView);