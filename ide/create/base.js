'use strict';

const AddAvailableCreators = (selectedFileInfo, source, sourceChangeSet, all, available, unavailable)=>{
    let didGroup = false;

    all.forEach((creator)=>{
        const instance = new creator(selectedFileInfo, source, sourceChangeSet);
        if (instance.applicable) {
            if (!didGroup) {
                available.push(instance.group);
                didGroup = true;
            }
            available.push(instance);
        } else {
            unavailable.push(instance);
        }
    });
};

const LookupAvailableCreators = (selectedFileInfo, source, sourceChangeSet)=>{
    const available = [];
    const unavailable = [];

    AddAvailableCreators(selectedFileInfo, source, sourceChangeSet, VIEW_CREATORS, available, unavailable);
    AddAvailableCreators(selectedFileInfo, source, sourceChangeSet, CONTROLLER_CREATORS, available, unavailable);
    AddAvailableCreators(selectedFileInfo, source, sourceChangeSet, MODEL_CREATORS, available, unavailable);

    if (unavailable.length > 0){
        available.push('Not Applicable')
        unavailable.forEach((u)=>available.push(u));
    }

    return available;
};

const CreateDialog = (selectedFileInfo, source, sourceChangeSet)=>{
    const panel = document.createElement('div');
    panel.classList.add('ide-create-dialog-panel');

    const tabs = document.createElement('div');
    tabs.classList.add('ide-create-dialog-panel-tabs');
    panel.appendChild(tabs);

    const views = document.createElement('div');
    views.classList.add('ide-create-dialog-panel-views');
    panel.appendChild(views);

    LookupAvailableCreators(selectedFileInfo, source, sourceChangeSet).forEach((available)=>{
        if (typeof available === 'string'){
            const category = document.createElement('h2');
            category.innerText = available;
            tabs.appendChild(category);
        } else {
            const title = document.createElement('span');
            title.innerText = ' ' + available.groupName;

            const tab = UITab.create([available.icon.em(), title], () => {
                const view = available.createView();
                view.id = available.constructor.name; // class name
                views.appendChild(view);
                return view;
            }, 'New: ' + available.name);

            tabs.appendChild(tab);
        }
    });

    const dialog = new UIDialog(panel, 'New');

    dialog.addEventListener(UITab.ChangeEventName, function(event){
        if (event.detail.tab.plainTextTitle) dialog.title = event.detail.tab.plainTextTitle;
        event.stopPropagation();
    });

    return dialog;
};



/**
 * Base class for encapsulating new file creation logic.
 */
class CreateBase {
    constructor(selectedFileInfo, source, sourceChangeSet) {
        this._selectedFileInfo = selectedFileInfo;
        this._source = source;
        this._sourceChangeSet = sourceChangeSet;
    }

    get applicable(){
        return true;
    }

    get sourceChangeSet(){
        return this._sourceChangeSet;
    }

    get source(){
        return this._source;
    }

    get selected(){
        return this._selectedFileInfo;
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
     * Full name, regardless of #group.
     */
    get name(){
        throw 'Not implemented: #name';
    }

    /**
     * Group title
     */
    get group(){
        return '';
    }

    /**
     * The name of this relative to the group.
     */
    get groupName(){
        return this.name;
    }

    /**
     * This should include any 'about' / informative text, or links to docs.
     */
    createView(){
        throw 'Not implemented: #createView';
    }
}

class EmojiCreator extends CreateBase{
    constructor(selectedFileInfo, source, sourceChangeSet, emojiIcon, name, group, groupName){
        super(selectedFileInfo, source, sourceChangeSet);
        this._icon = new UIIcon(emojiIcon);
        this._name = name;
        this._group = group;
        this._groupName = groupName;
    }

    get icon(){
        return this._icon;
    }

    get name(){
        return this._name;
    }

    get group(){
        return this._group;
    }

    get groupName(){
        return this._groupName ? this._groupName : this.name;
    }

}