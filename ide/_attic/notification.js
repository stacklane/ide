class Notifications {
    constructor(element) {
        this._element = element;
    }

    _submit(message, taskPromise){
        this._element.appendChild(new Notification(message, taskPromise));
    }

    //deleteFile(fileInfo, taskPromise) {
    //    this._submit('Delete: "' + fileInfo.path + '"', taskPromise);
    // }
}

class Notification extends HTMLElement{
    constructor(message, taskPromise) {
        super();
        if (!message) throw '!message';
        if (!taskPromise) throw '!taskPromise';
        this.classList.add('is-pending');
        this._created = new Date();
        this._message = message;
        this.innerText = message;

        taskPromise
            .then(()=>{this.classList.remove('is-pending'); this.classList.add('is-fulfilled')})
            .catch((e)=>{
                this._error = e;
                this.classList.remove('is-pending');
                this.classList.add('is-rejected');
                this.innerHTML = this.innerText + '<br>' + e.message;
                throw e; // Rethrow to keep the taskPromise chain rejected/failed
            });
    }
}
window.customElements.define('ide-notification', Notification);
