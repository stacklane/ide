'use strict';

const VIEW_GROUP = "View";


/**
 * TODO mustache by default.. find a 'super' as an option?
 */
class HTMLViewCreator extends EmojiCreator{
    static _template() { return `
<blockquote>
    An HTML view, using Mustache or plain HTML.
</blockquote>
<div>
    <div class="current-dir"></div>
    
    <div>
      <label><input checked type="radio" name="type" value="mustache"> Mustache</label>
    </div>
    
    <div>
      <label><input type="radio" name="type" value="plain"> Plain HTML</label>
    </div>  
    
    <div>
        <input type="text" name="name" placeholder="endpoint-name" value="" autocomplete="off" autocapitalize="off">
    </div>
    
    <div class="is-error">
        
    </div>    
</div>   
<footer>
    <button disabled>Create</button>
</footer>
    `};

    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, 'H', 'HTML View', VIEW_GROUP, 'HTML');
        this._dirInfo = selectedFileInfo;
    }

    get applicable(){
        return this._dirInfo.isEndpointAllowed();
    }

    createView(){
        const view = Elements.div().classes('ide-create-dialog-standard-view').create();

        if (this._dirInfo.isEndpointAllowed()){
            view.innerHTML = HTMLViewCreator._template();

            view.querySelector('.current-dir').innerText = 'Directory: ' + this._dirInfo.path;

            const error = view.querySelector('.is-error');
            const input = view.querySelector('input[name="name"]');

            input.addEventListener('keyup', function(event){
                if (!Validation.uid(input.value)){
                    // TODO better
                    error.innerText = 'Must be a valid endpoint name.'
                } else {
                    error.innerText = '';
                }
            });
        } else {
            const error = Elements.div()
                .text('Endpoints not allowed in this directory').create();
            view.appendChild(error);
        }


        return view;
    }
}

class ImageUploadCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '🌇', 'Image', VIEW_GROUP);
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'image';
        return view;
    }
}

class SCSSCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, 'S', 'SCSS', VIEW_GROUP);
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'scss';
        return view;
    }
}

class ClientSideJavaScriptCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, 'J', 'JavaScript', VIEW_GROUP);
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'js';
        return view;
    }
}

/**
 * TODO name of path param, and the type... model or options (draw from existing models)
 */
class DynamicPathCreator extends EmojiCreator{
    constructor(selectedFileInfo, source) {
        super(selectedFileInfo, source, '🔗', 'Dynamic Path');
    }

    createView(){
        const view = document.createElement('div');
        view.innerText = 'Dynamic Path View';
        return view;
    }
}


const VIEW_CREATORS = [HTMLViewCreator, ImageUploadCreator, SCSSCreator,
    ClientSideJavaScriptCreator, DynamicPathCreator];