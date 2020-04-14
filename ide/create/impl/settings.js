'use strict';

/**
 * TBD... see other notes... on where settings should exist.
 */

class UserSettingsCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '👤', 'User Settings');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'users';
        return view;
    }
}

/**
 * TODO this should provide a drop down of current versions..
 *       probably hardcoded for now, but needs to kind of be a library of definitions
 *       could be hardcoded as a static model, and then fetched... basically somewhat of things to come.
 *       - and it will append to an existing connector config if it exists, or create a new one.
 */
class ConnectorCreator extends CreatorImpl{
    constructor(sourceContext) {
        super(sourceContext, '🔌', 'Connector');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'connector';
        return view;
    }
}

