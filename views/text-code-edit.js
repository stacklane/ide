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

const TAB_SPACES = '    '; // 4 -- For consistency, this should be same as tab-size in CSS
const LINE_HEIGHT_PX = Math.floor(15.6 /* value from line-height in CSS */);

class TextCodeEdit extends HTMLElement{
    constructor() {
        super();

        const gutter = document.createElement('div');
        gutter.classList.add('text-code-edit-gutter');
        this.appendChild(gutter);
        this._gutter = gutter;

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
        this._area.addEventListener('keyup', function(event){ that._refreshLineNum()});
        this._area.addEventListener('mouseup', function(event){ that._refreshLineNum()});
        // needs work: this._area.addEventListener('focus', function(event){ that._refreshLineNum()});
    }

    showFocus(){
        this._area.focus({preventScroll:true});
    }

    get value(){
        return this._area.value;
    }

    set value(val){
        this._area.value = val;
        this._refreshSize();
    }

    get currentLineNumber(){
        const ta = this._area;
        try {
            return ta.value.substr(0, ta.selectionStart).split("\n").length;
        } catch (t){
            return -1;
        }
    }

    _refreshLineNum(){
        const lineNum = this.currentLineNumber;
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
     * https://stackoverflow.com/questions/44471699/how-to-make-undo-work-in-an-html-textarea-after-setting-the-value
     * https://stackoverflow.com/questions/44471699/how-to-make-undo-work-in-an-html-textarea-after-setting-the-value
     * https://stackoverflow.com/questions/13597007/how-can-i-undo-the-programmatic-insertion-of-text-into-a-textarea
     *
     * TODO #execCommand is non-standard -- to replace, we'd need something to handle undo history.
     *      something about a text event here:
     *      https://stackoverflow.com/q/19814465
     */
    _keyDownHandler(event){
        const area = this._area;
        const cursor = area.selectionStart;

        if (event.key === "Tab"){

            /**
             * WARNING: A known issue is that use of setRangeText does not impact undo/redo history.
             */

            event.preventDefault();

            // TODO outdent/indent should support multiple line selection, not just current line

            const currentSelectionStart = area.selectionStart;
            const currentSelectionEnd = area.selectionEnd;

            let prevNewLine = area.value.lastIndexOf('\n', currentSelectionStart - 1);

            if (event.shiftKey) {
                // Outdent

                // TODO outdent, find beginning of line.. only outdent when reached, but don't delete a new line.
                //    CAN use setRangeText to replace a value with ''

            } else {
                // Indent
                area.setRangeText(TAB_SPACES, prevNewLine + 1, prevNewLine + 1);
            }

        } else if (event.key === "Enter") {

            event.preventDefault();

            /**
             * Retain indentation of current line, whether tabs or spaces.
             */
            let indent = '';
            if (this._retainIdentation) {
                const here = area.selectionStart;
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

}
window.customElements.define('text-code-edit', TextCodeEdit);




