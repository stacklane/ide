'use strict';

const _AddAvailableCreators = (sourceContext, all, available, unavailable)=>{
    let didGroup = false;

    all.forEach((creator)=>{
        const instance = new creator(sourceContext);
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

const _LookupAvailableCreators = (sourceContext)=>{
    const available = [];
    const unavailable = [];

    _AddAvailableCreators(sourceContext, VIEW_CREATORS, available, unavailable);
    _AddAvailableCreators(sourceContext, CONTROLLER_CREATORS, available, unavailable);
    _AddAvailableCreators(sourceContext, MODEL_CREATORS, available, unavailable);

    if (unavailable.length > 0){
        available.push('Not Applicable')
        unavailable.forEach((u)=>available.push(u));
    }

    return available;
};

const CreatorDialog = (sourceContext)=>{
    const panel = document.createElement('div');
    panel.classList.add('ide-create-dialog-panel');

    const tabs = new UISideBar();
    tabs.classList.add('ide-create-dialog-panel-tabs',
        'ui-secondary-dialog-content', '--ui-tab-is-pill-item', 'has-xs-spacing');
    panel.appendChild(tabs);

    const views = document.createElement('div');
    views.classList.add('ide-create-dialog-panel-views');
    panel.appendChild(views);

    _LookupAvailableCreators(sourceContext).forEach((available)=>{
        if (typeof available === 'string'){
            const category = Elements.h5()
                .text(available)
                .classes('is-secondary-label', 'is-weight-semibold')
                .create();
            tabs.appendChild(category);
        } else {
            const title = document.createElement('span');
            title.innerText = ' ' + available.groupName;

            const tab = new UITab(new UIBar([available.icon, title]), () => {
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
class Creator {
    constructor(sourceContext) {
        this._context = sourceContext;
    }

    get applicable(){
        return true;
    }

    get context(){
        return this._context;
    }

    get sourceChangeSet(){
        return this._context.changes;
    }

    get source(){
        return this._context.source;
    }

    get selected(){
        return this._context.file;
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

class CreatorImpl extends Creator{
    constructor(sourceContext, icon, name, group, groupName){
        super(sourceContext);
        this._icon = icon instanceof UIIcon ? icon : new UIIcon(icon);
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