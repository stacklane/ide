'use strict';

const CONTROLLER_GROUP = "Logic";

/**
 * TODO if not in suppler directory already, then this will create one.
 *       should assist with choosing the recommended "NameFormat".
 *
 *      HTML vs JS supplier option
 */
class SupplierCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '📤', 'Supplier', CONTROLLER_GROUP);
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'Supplier View';
        return view;
    }
}


/**
 * TODO 'method' .. and maybe some import option?
 */
class GETJavaScriptCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '🖥', 'GET Action', CONTROLLER_GROUP, 'GET');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'GET';
        return view;
    }
}

class POSTJavaScriptCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '📮', 'POST Action', CONTROLLER_GROUP, 'POST');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'POST';
        return view;
    }
}

class DELETEJavaScriptCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '❌', 'DELETE Action', CONTROLLER_GROUP, 'DELETE');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'delete';
        return view;
    }
}

const CONTROLLER_CREATORS = [
    GETJavaScriptCreator, POSTJavaScriptCreator, DELETEJavaScriptCreator,
    SupplierCreator
];
