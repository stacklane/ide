'use strict';

/**
 * For Safari
 */
(function () {
    File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
    Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;

    function myArrayBuffer() {
        // this: File or Blob
        return new Promise((resolve) => {
            let fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result);
            };
            fr.readAsArrayBuffer(this);
        })
    }
})();

class Validation {
    static uid(str){
        if (!str) return false;
        return str.match(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    }

    static lowerCaseCamel(str){
        if (!str) return false;
        return str.match(/^[a-z]+(?:[A-Z][a-z]+)*$/);
    }
}