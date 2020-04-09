
class SupplierCreate extends CreateBase{
    constructor(fileInfo) {
        super(fileInfo);

        this._icon = new UIIcon('📤');
    }

    get icon(){
        return this._icon;
    }

    get name(){
        return 'Supplier';
    }

    get view(){
        if (this._view) return this._view;

        const view = document.createElement('div');
        view.innerText = 'hi';
        this.appendChild(view);

        this._view = view;

        return this._view;
    }
}

