/**
 * Utility to be used inside the 'display' of the UITab,
 * and styled in an implementation specific way using classes.
 */
class UITabCloser extends HTMLElement {
    constructor(){
        super();
        this.addEventListener('click', ()=>{
           this.closest('ui-tab').close();
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
    static get ViewTabId(){
        return 'data-ui-tab-view-id';
    }
    static get ActivatedAttribute(){
        return 'data-ui-tab-view-active';
    }

    static Find(elementStart, id){
        return elementStart.querySelector('ui-tab[' + UITab.ViewTabId + '="' + id + '"]');
    }

    constructor(display, view) {
        super();

        if (!view.id) throw '!view.id';

        this.setAttribute('role', 'tab');
        this.setAttribute('aria-selected', 'false');
        this.setAttribute('data-ui-tab-view-id', view.id);

        this._view = view;

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

        this.addEventListener('click', ()=>this.activate());
    }

    get active(){
        return this.getAttribute('active') === 'true';
    }

    get view(){
        return this._view;
    }

    toString(){
        return 'UITab[' + this._view + ']';
    }

    activate(){
        if (this.parentElement)
            this.parentElement.querySelectorAll('ui-tab').forEach(e=>e.deactivate());

        this.setAttribute('active', 'true');
        this.setAttribute('aria-selected', 'true');
        this._view.setAttribute(UITab.ActivatedAttribute, 'true');
    }

    deactivate(){
        this.setAttribute('active', 'false');
        this.setAttribute('aria-selected', 'false');
        this._view.setAttribute(UITab.ActivatedAttribute, 'false');
    }

    close(){
        // If active, then auto-select to left (preferred), or right (as fallback), or nothing:
        const nextSelection = this.active ?
            (this.previousElementSibling ?
                this.previousElementSibling : this.nextElementSibling)
            : null;

        this.deactivate();
        this._view.remove();
        this.remove();

        if (nextSelection != null && nextSelection instanceof UITab) {
            nextSelection.activate();
        }
    }
}
window.customElements.define('ui-tab', UITab);