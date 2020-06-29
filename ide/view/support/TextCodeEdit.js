/**
 * Simple <textarea> based code editor, without syntax highlighting.
 *
 * Auto-size:
 *
 * FOR WIDTH:
 * https://alistapart.com/article/expanding-text-areas-made-elegant/
 *
 * FOR HEIGHT:
 * https://codepen.io/vsync/pen/frudD
 */

const LINE_HEIGHT_PX = Math.floor(15.6 /* value from line-height in CSS */);

'use strict';

class TextCodeEdit extends HTMLElement{
    constructor(language) {
        super();

        this.classList.add('lang-' + language);

        const gutter = document.createElement('div');
        gutter.classList.add('text-code-edit-gutter');
        this.appendChild(gutter);
        this._gutter = gutter;
        this._dirty = false;

        this._retainIdentation = true;

        const expandingArea = document.createElement('div');
        expandingArea.classList.add('text-code-edit-area');

        // Note: pre must come before the textarea for proper width handling
        expandingArea.innerHTML = `
            <pre><span></span><br></pre>
            <textarea spellcheck="false" autocapitalize="none" autocomplete="off"></textarea>
        `;
        this.appendChild(expandingArea);

        this._pre = this.querySelector('pre');
        this._preSpan = this.querySelector('pre span');
        this._area = this.querySelector('textarea');

        const that = this;
        this._area.addEventListener('input', function( event ) { that._refreshSize();});
        this._area.addEventListener('keydown', function( event ) { that._keyDownHandler(event);});
        this._area.addEventListener('keyup', function(event){
            that._dirty = true;
            that._refreshLineNum()}
        );
        this._area.addEventListener('change', function(){that._dirty = true});
        this._area.addEventListener('mouseup', function(event){ that._refreshLineNum()});
        // needs work: this._area.addEventListener('focus', function(event){ that._refreshLineNum()});

        this._setTabSize();
    }

    showFocus(){
        this._area.focus({preventScroll:true});
    }

    get isDirty(){
        return this._dirty;
    }

    resetDirty(){
        this._dirty = false;
    }

    get value(){
        return this._area.value;
    }

    set value(val){
        this._area.value = val;
        this._refreshSize();
    }

    get _currentLineAndColumn(){
        try {
            const ta = this._area;
            const lines = ta.value.substring(0, ta.selectionStart).split("\n");
            const column = lines[lines.length-1].length;
            return [lines.length, column];
        } catch (t){
            return [-1, -1];
        }
    }

    _refreshLineNum(){
        const [lineNum, colNum] = this._currentLineAndColumn;
        const lineNumElement = this.querySelector('div[data-line-num="' + lineNum + '"]');

        let remove = false;

        if (lineNumElement){
            if (lineNumElement.classList.contains('active')){
                // Already active
                remove = false;
            } else {
                lineNumElement.classList.add('active');
                remove = true;
            }
        }

        if (remove){
            const elements = this.querySelectorAll('div.active[data-line-num]:not([data-line-num="' + lineNum + '"])');
            for (let i = 0; i < elements.length; i++){
                const element = elements.item(i);
                element.classList.remove('active');
            }
        }
    }

    _refreshSize(){
        this._preSpan.textContent = this._area.value;
        const extra = -1;
        const neededRows = Math.ceil(this._pre.scrollHeight / LINE_HEIGHT_PX) + extra;
        if (neededRows === this._area.rows) return; // Already correct size

        ///
        this._area.rows = neededRows;
        ///

        // TODO since we're typically only adding or removing one line at a time
        //       it would be more performant to only trim or append to the bottom as needed
        const targetLength = (neededRows + '').length + 1;
        let lineNums = '';
        for (let i = 1; i <= neededRows; i++)
            lineNums += '<div data-line-num="' + i + '">' + (i + '\n').padStart(targetLength) + '</div>';
        this._gutter.innerHTML = lineNums;
    }

    /**
     * #execCommand is non-standard but necessary to retain undo history
     *
     * #setRangeText on the other hand does not impact undo history
     *
     * https://stackoverflow.com/questions/44471699/how-to-make-undo-work-in-an-html-textarea-after-setting-the-value
     * https://stackoverflow.com/questions/44471699/how-to-make-undo-work-in-an-html-textarea-after-setting-the-value
     * https://stackoverflow.com/questions/13597007/how-can-i-undo-the-programmatic-insertion-of-text-into-a-textarea
     */
    _keyDownHandler(event){
        const area = this._area;
        const cursor = area.selectionStart;

        const currentSelectionStart = area.selectionStart;
        const currentSelectionEnd = area.selectionEnd;

        if (event.key === "Backspace"){

            /**
             * Backspace-as-outdent
             *
             * If deleting a space, and there are "tab size" more spaces ahead of it, then delete those too.
             */
            if (currentSelectionStart === currentSelectionEnd && currentSelectionStart > this._tabSize){
                const lookStart = currentSelectionStart - this._tabSize;
                const lookEnd = currentSelectionStart;

                for (let i = lookStart; i < lookEnd; i++){
                    const char = area.value.charCodeAt(i);
                    if (char !== 32) return; // exit handler
                }

                event.preventDefault();
                area.setSelectionRange(lookStart, lookEnd);
                document.execCommand("insertText", false, '');
            }

        } else if (event.key === "Tab"){

            event.preventDefault();

            // TODO outdent/indent should support multiple line selection, not just current line
            //      also review WebStorm behavior -- should we "fix up" or normalize the indentation across multiple lines?

            const prevNewLine = area.value.lastIndexOf('\n', currentSelectionStart - 1);
            const firstCharAfterNewLine = prevNewLine + 1;

            if (event.shiftKey) {

                /**
                 * Outdent
                 */

                let lastSpace = -1;

                for (let i = firstCharAfterNewLine; i <= currentSelectionStart; i++){
                    const char = area.value.charCodeAt(i);
                    if (char === 32) {
                        lastSpace = i;
                    } else {
                        break;
                    }
                }

                if ((lastSpace - firstCharAfterNewLine) + 1 >= this._tabSize) {
                    area.setSelectionRange(lastSpace - this._tabSize + 1, lastSpace + 1);
                    document.execCommand("insertText", false, '');
                    // retain current selection, by moving it backwards:
                    area.setSelectionRange(currentSelectionStart - this._tabSize, currentSelectionEnd - this._tabSize);
                }

            } else {

                /**
                 * Indent
                 */

                area.setSelectionRange(firstCharAfterNewLine, firstCharAfterNewLine);
                document.execCommand("insertText", false, this._tabString);
                area.setSelectionRange(currentSelectionStart + this._tabSize, currentSelectionEnd + this._tabSize);

            }

        } else if (event.key === "Enter") {

            /**
             * Retain indentation of current line, whether tabs or spaces.
             */

            event.preventDefault();

            let indent = '';

            if (this._retainIdentation) {
                const here = currentSelectionStart;
                const prevNewLine = area.value.lastIndexOf('\n', here - 1);
                if (prevNewLine > -1 && prevNewLine < here) {
                    for (let i = prevNewLine + 1; i < here; i++) {
                        const cc = area.value.charCodeAt(i);
                        if (cc === 32 || cc === 9) {
                            indent += ' ';
                        } else {
                            break;
                        }
                    }
                }
            }

            /**
             * Insert newline character, and then optional indentation for start of the new line.
             */
            document.execCommand("insertText", false, '\n' + indent);

        }
    }

    /**
     * Highly reliant on the CSS targeting specific languages.
     */
    _setTabSize(){
        this._tabSize = window.getComputedStyle(this._area).getPropertyValue('tab-size');
        if (!this._tabSize || this._tabSize < 2 || this._tabSize > 4) this._tabSize = 4;
        this._tabSize = Number(this._tabSize);
        this._tabString = ''.padStart(this._tabSize, ' ');
    }

    connectedCallback(){
        this._setTabSize();
        this.classList.add('ui-scrollable-xy');
    }

}
window.customElements.define('text-code-edit', TextCodeEdit);




