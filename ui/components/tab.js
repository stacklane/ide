/**
 * Utility to be used inside the 'display' of the UITab,
 * and styled in an implementation specific way using classes.
 */
class UITabCloser extends HTMLElement {
    constructor(){
        super();
        const that = this;
        this.addEventListener('click', (event)=>{
           that.closest('ui-tab').close();
           event.stopPropagation(); // prevent UITab from also recognizing click
        });
    }
}
window.customElements.define('ui-tab-closer', UITabCloser);

/**
 * Toggle for any other {HtmlElement} as a view.
 *
 * A series of related UITab's must exist within a common parent element.
 *
 * Styled in an implementation specific way using classes.
 *
 * UITab's make no assumption about where their corresponding view exists in the document.
 *
 * @param {view} should define an #id, and observe activation:
 *        static get observedAttributes() { return [UITab.ActivatedAttribute]; }
 *        attributeChangedCallback(name, oldValue, newValue) {
 *            if (name === UITab.ActivatedAttribute && newValue === 'true) {
 *                ...
 *            }
 *        }
 */
class UITab extends HTMLElement{
    static get ChangeEventName(){
        return 'UITab#change';
    }
    static get ViewTabId(){
        return 'data-ui-tab-view-id';
    }
    static get ActivatedAttribute(){
        return 'data-ui-tab-view-active';
    }

    static find(elementStart, id){
        return elementStart.querySelector('ui-tab[' + UITab.ViewTabId + '="' + id + '"]');
    }

    static create(display, view, plainTitle){
        return new UITab(display, view, plainTitle);
    }

    /**
     * Use UITab#create
     */
    constructor(display, view, plainTitle) {
        super();

        this.setAttribute('role', 'tab');
        this.setAttribute('tabindex', '-1');
        this.setAttribute('aria-selected', 'false');

        if (typeof view === 'function'){
            this._viewSupplier = view;
        } else if (view instanceof HTMLElement){
            if (!view.id) throw '!view.id';
            this.setAttribute(UITab.ViewTabId, view.id);
            this._view = view;
        }

        if (typeof display === 'string'){
            const displaySpan = document.createElement('span');
            displaySpan.innerText = display;
            this.appendChild(displaySpan);
        } else if (display instanceof HTMLElement) {
            this.appendChild(display);
        } else if (display instanceof Array){
            for (let i = 0; i < display.length; i++) this.appendChild(display[i]);
        } else {
            throw '!display';
        }

        this._plainTitle = plainTitle;
        this.addEventListener('click', ()=>this.activate());
    }

    /**
     * Optional
     */
    get plainTextTitle(){
        return this._plainTitle;
    }

    get active(){
        return this.getAttribute('active') === 'true';
    }

    get view(){
        if (this._view) return this._view;

        this._view = this._viewSupplier();
        if (!this._view.id) throw '!view.id';
        this.setAttribute(UITab.ViewTabId, this._view.id);

        return this._view;
    }

    toString(){
        return 'UITab[' + this._view ? this._view.id : 'na' + ']';
    }

    activate(){
        if (this.parentElement)
            this.parentElement.querySelectorAll('ui-tab').forEach(e=>e.deactivate());

        this.setAttribute('active', 'true');
        this.setAttribute('aria-selected', 'true');

        this.view.setAttribute(UITab.ActivatedAttribute, 'true');

        // Instead:
        const toFocus = this.view.querySelectorAll('input, textarea, select');
        if (toFocus.length > 0) toFocus[0].focus();

        this._fireChangeEvent();
    }

    async _fireChangeEvent(){
        this.dispatchEvent(new CustomEvent(UITab.ChangeEventName, {bubbles:true, detail:{tab: this}}));
    }

    deactivate(){
        this.setAttribute('active', 'false');
        this.setAttribute('aria-selected', 'false');

        if (this._view) this._view.setAttribute(UITab.ActivatedAttribute, 'false');
    }

    close(){
        // If active, then auto-select to left (preferred), or right (as fallback), or nothing:
        const nextSelection = this.active ?
            (this.previousElementSibling ?
                this.previousElementSibling : this.nextElementSibling)
            : null;

        this.deactivate();
        if (this._view) this._view.remove();
        this.remove();

        if (nextSelection != null && nextSelection instanceof UITab) {
            nextSelection.activate();
        }
    }
}
window.customElements.define('ui-tab', UITab);