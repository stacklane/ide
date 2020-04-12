
/**
 * https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/
 *
 * // https://css-tricks.com/considerations-styling-modal/

 // TODO accessibility...
 // https://github.com/gdkraus/accessible-modal-dialog

    TODO dialog element as it becomes available:
   https://caniuse.com/#search=dialog
     polyfill
    https://blog.logrocket.com/the-dialog-element-the-way-to-create-tomorrows-modal-windows-f1d4ab14380b/

 */
class UIModal extends HTMLElement{
    static _isVisibleElement(element){
        // jquery approach
        // https://stackoverflow.com/questions/13388616/firefox-query-selector-and-the-visible-pseudo-selector
        return element.offsetWidth > 0 || element.offsetHeight > 0;
    }

    constructor(content) {
        super();

        this.setAttribute('tabindex', '0'); // necessary for focus() call to work
        this.setAttribute('aria-hidden', 'true');
        this.setAttribute('role', 'dialog');

        const bg = document.createElement('div');
        bg.classList.add('ui-modal-background');
        bg.setAttribute('tabindex', '-1');
        this.appendChild(bg);

        this._putContent(content);

        const that = this;
        this.addEventListener('keydown', function(event){
            if (event.key === 'Escape') {
                that._esc(event);
            } else if (event.key === 'Tab'){
                that._tab(event);
            }
        });
    }

    _esc(event){
        this.close();
        event.preventDefault();
    }

    /**
     * Trap the tab key within the modal, to prevent it from going to 'outer' / main document.
     */
    _tab(event){
        event.preventDefault(); // always?

        // get list of all children elements:
        const o = Array.from(this.querySelectorAll('.ui-modal-content *'));

        // get list of focusable items
        const focusableItems = o.filter((e)=>UIModal._isVisibleElement(e));

        // get currently focused item
        const focusedItem = document.activeElement;

        // get the number of focusable items
        const numberOfFocusableItems = focusableItems.length

        // get the index of the currently focused item
        const focusedItemIndex = focusableItems.index(focusedItem);

        if (event.shiftKey) {
            // back tab
            // if focused on first item and user preses back-tab, go to the last focusable item
            if (focusedItemIndex == 0) {
                focusableItems.get(numberOfFocusableItems - 1).focus();
                event.preventDefault();
            }
        } else {
            // forward tab
            // if focused on the last item and user preses tab, go to the first focusable item
            if (focusedItemIndex == numberOfFocusableItems - 1) {
                focusableItems.get(0).focus();
                event.preventDefault();
            }
        }
    }

    _putContent(element){
        const content = document.createElement('div');
        content.classList.add('ui-modal-content');
        this.appendChild(content);
        content.appendChild(element);
    }

    show(){
        this._currentActiveElement = document.activeElement;
        document.body.appendChild(this);
        this.setAttribute('active', '');
        this.setAttribute('aria-hidden', 'false');
        this.focus();
    }

    close(){
        this.removeAttribute('active');
        document.body.removeChild(this);

        // Restore focus
        if (this._currentActiveElement) this._currentActiveElement.focus();
    }
}
window.customElements.define('ui-modal', UIModal);