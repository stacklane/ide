const LookupAvailableCreate = (fileInfo)=>{
    const out = [];

    out.push(new SupplierCreate(fileInfo));


    return out;
};

const CreateDialog = (fileInfo)=>{
    const list = document.createElement('ul');

    LookupAvailableCreate(fileInfo).forEach((available)=>{
       const item = document.createElement('li');
       item.appendChild(available.icon.small());

       const title = document.createElement('span');
       title.innerText = ' ' + available.name;
       item.appendChild(title);

       list.appendChild(item);
    });

    const content = document.createElement('div');
    content.classList.add('ui-dialog-list');

    content.appendChild(list);

    // TODO somehow updated for each selection
    const main = document.createElement('div');
    main.innerText = 'hi';
    content.appendChild(main);

    return new UIDialog(content, 'New' /* TODO would be ideal to update this using current selection */);
};


/**
 * Base class for encapsulating new file creation logic.
 */
class CreateBase /*extends HTMLElement*/{
    constructor(contextFileInfo) {
        //super();
        this._contextFileInfo = contextFileInfo;

    }

    get context(){
        return this._contextFileInfo;
    }

    /**
     * @return {boolean} true if this uses the current file info as a context for creation,
     *         or false if this has the same result regardless of whether its initiated.
     */
    get contextual(){
        return true;
    }

    /**
     * @return {UIIcon}
     */
    get icon(){
        throw 'Not implemented: #icon';
    }

    /**
     * Simple text name / title.
     */
    get name(){
        throw 'Not implemented: #name';
    }

    get view(){
        throw 'Not implemented: #view';
    }

    submit(){
        throw 'Not implemented: #submit';
    }
}