/**
 *

 TAB:
 https://philipnewcomer.net/2015/11/how-to-make-the-tab-key-indent-text-in-a-texarea/
 https://css-tricks.com/snippets/javascript/support-tabs-in-textareas/

 CURRENT SEL:
 https://stackoverflow.com/a/32549918

 LINE NUMS:
 https://codepen.io/elomatreb/pen/hbgxp  (css counter increment)
 https://stackoverflow.com/questions/1995370/html-adding-line-numbers-to-textarea (canvas)
 https://www.codeproject.com/Tips/5163219/HTML-Line-Numbering-using-textarea
 also counter-increment:
 https://github.com/MatheusAvellar/textarea-line-numbers
*/

const TAB_SPACES = '    '; // 4 -- For consistency, this should be same as tab-size in CSS.
const LINE_HEIGHT_PX = Math.floor(15.6 /* value from line-height in CSS */);

/**
 * Simple <textarea> based code editor.
 *
 * Auto-size:
 *
 * FOR WIDTH:
 * https://alistapart.com/article/expanding-text-areas-made-elegant/
 *
 * FOR HEIGHT:
 * https://codepen.io/vsync/pen/frudD
 */
class TextCodeEdit extends HTMLElement{
    constructor() {
        super();

        const gutter = document.createElement('div');
        gutter.classList.add('text-code-edit-gutter');
        this.appendChild(gutter);
        this._gutter = gutter;

        const expandingArea = document.createElement('div');
        expandingArea.classList.add('text-code-edit-area');

        // Note pre must come before the textarea for proper width handling
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
        this._area.addEventListener('keydown', function( event ) { that._keyHandler(event);});

        // Safari does not yet support overflow-scroll:none, so:
        // but this does not work:
        //this.addEventListener('touchmove',function(event){ event.preventDefault(); });
    }

    get value(){
        return this._area.value;
    }

    set value(val){
        this._area.value = val;
        this._refreshSize();
    }

    _refreshSize(){
        this._preSpan.textContent = this._area.value;
        const extra = 0;
        const rows = Math.ceil(this._pre.scrollHeight / LINE_HEIGHT_PX) + extra;
        const targetLength = (rows + '').length + 1;
        this._area.rows = rows;
        let lineNums = '';
        for (let i = 1; i <= rows; i++) lineNums += (i + '\n').padStart(targetLength);
        this._gutter.innerText = lineNums;
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
    _keyHandler(event){
        const area = this._area;
        const cursor = area.selectionStart;

        // #execCommand both enables native undo, and moves the cursor.

        if (event.key === "Tab"){
            event.preventDefault();
            // Tabs vs spaces are a hot topic:
            // https://stackoverflow.com/questions/19975954/a-yaml-file-cannot-contain-tabs-as-indentation]
            // but we go with spaces, like YAML:
            // https://yaml.org/faq.html
            if (event.shiftKey) {
                // Outdent

                // TODO find beginning of line.. only outdent when reached

            } else {
                // Indent
                document.execCommand("insertText", false, TAB_SPACES);
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            document.execCommand("insertText", false, '\n');
        }
    }

}
window.customElements.define('text-code-edit', TextCodeEdit);




