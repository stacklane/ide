class UIIcon extends HTMLElement{
    constructor(string) {
        super();
        if (string.indexOf("<svg") === 0){
            this.innerHTML = string;
        } else if ([...string].length == 1){ // actual character count, via MDN
            this.innerText = string;
        } else {
            throw string;
        }
    }

    small(){
        this.classList.add('is-small');
        return this;
    }

    em(){
        this.classList.add('is-em');
        return this;
    }

    classes(classes){
        this.classList.add(classes);
        return this;
    }
}
window.customElements.define('ui-icon', UIIcon);