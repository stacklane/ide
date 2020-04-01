
// title deafult to 'New Project'
// icon (svg content)
// ...

class Toolbar extends HTMLElement{
    constructor() {
        super();
    }
}
class ToolbarLeft extends HTMLElement{
    constructor() {
        super();
    }
}
class ToolbarRight extends HTMLElement{
    constructor() {
        super();
    }
}
class ToolbarItem extends HTMLElement{
    constructor() {
        super();
    }
}

window.customElements.define('ide-toolbar', Toolbar);
window.customElements.define('ide-toolbar-left', ToolbarLeft);
window.customElements.define('ide-toolbar-right', ToolbarRight);
window.customElements.define('ide-toolbar-item', ToolbarItem);