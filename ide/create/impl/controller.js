'use strict';

const CONTROLLER_GROUP = "Logic";

/**
 * TODO if not in suppler directory already, then this will create one.
 *       should assist with choosing the recommended "NameFormat".
 *
 *      HTML vs JS supplier option
 */
class SupplierCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '📤', 'Supplier', CONTROLLER_GROUP);
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
class GETJavaScriptCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '🖥', 'GET Action', CONTROLLER_GROUP, 'GET');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'GET';
        return view;
    }
}

class POSTJavaScriptCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '📮', 'POST Action', CONTROLLER_GROUP, 'POST');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'POST';
        return view;
    }
}

class DELETEJavaScriptCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '❌', 'DELETE Action', CONTROLLER_GROUP, 'DELETE');
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
