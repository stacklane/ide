'use strict';

const MODEL_GROUP = "Model";

class UniversalModelCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '🌐', 'Universal Model', MODEL_GROUP, 'Universal');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'universal';
        return view;
    }
}

class ContentModelCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '📄', 'Content Model', MODEL_GROUP, 'Content');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'content';
        return view;
    }
}

class EmbeddedModelCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '📎', 'Embedded Model', MODEL_GROUP, 'Embedded');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'embed';
        return view;
    }
}

/**
 * TODO similar to supplier, will create supplier directory if not already in it.
 */
class FormModelCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '⏳', 'Form', MODEL_GROUP);
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'form';
        return view;
    }
}

const MODEL_CREATORS = [
    UniversalModelCreator,
    ContentModelCreator,
    EmbeddedModelCreator,
    FormModelCreator
];