

class UIDialog extends HTMLElement{
    constructor(content, title) {
        super();

        const header = document.createElement('div');
        header.classList.add('ui-dialog-title');
        this.appendChild(header);
        this._header = header;

        const h2 = document.createElement('h2');
        h2.innerText = title;
        header.appendChild(h2);

        const contentHolder = document.createElement('div');
        contentHolder.classList.add('ui-dialog-content');
        contentHolder.appendChild(content);

        this.appendChild(contentHolder);
    }

    modal(){
        const modal = new UIModal(this);

        const closer = document.createElement('div');
        closer.classList.add('ui-dialog-close');
        //closer.addEventListener('click', ()=>this.dispatchEvent(NEW_UI_MODAL_CLOSE_EVENT()));
        closer.addEventListener('click', ()=>modal.close());
        this._header.appendChild(closer);

        // TODO can't even get this to log...
        this.addEventListener('keydown', function(event){
            console.log(event.key);
            if (event.key === 'Escape') modal.close();
        });

        modal.show();
        //return modal;
    }
}
window.customElements.define('ui-dialog', UIDialog);