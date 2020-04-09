//const UI_MODAL_CLOSE_EVENT = 'UIModal#close';
//const NEW_UI_MODAL_CLOSE_EVENT = ()=>new CustomEvent(UI_MODAL_CLOSE_EVENT, {bubbles:true});

class UIModal extends HTMLElement{
    constructor(content) {
        super();

        this.setAttribute('tabindex', '0'); // necessary for focus() call to work

        const bg = document.createElement('div');
        bg.classList.add('ui-modal-background');
        this.appendChild(bg);

        this._putContent(content);

        //this.addEventListener(UI_MODAL_CLOSE_EVENT, ()=>this.close());

        /*
        if (withCloser) {
            const close = document.createElement('div');
            close.classList.add('ui-modal-close');
            close.addEventListener('click', ()=>this.close());
            this.appendChild(close);
        }*/
    }

    _putContent(element){
        const content = document.createElement('div');
        content.classList.add('ui-modal-content');
        this.appendChild(content);
        content.appendChild(element);
    }

    show(){
        document.body.appendChild(this);
        this.setAttribute('active', '');
        this.focus();
    }

    close(){
        this.removeAttribute('active');
        document.body.removeChild(this);
    }
}
window.customElements.define('ui-modal', UIModal);