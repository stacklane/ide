'use strict';

// https://github.com/pieroxy/lz-string
const _LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

class SourceChangeSet{
    static get SIZE_CHANGE() {return "SourceChangeSet#updateCount"};
    static get MOVE() {return "move"};
    static get CREATE() {return "create"};
    static get DELETE() {return "delete"};
    static get UPDATE() {return "update"};

    static fromLocalStorage(sessionId) {
        if (!sessionId) throw '!sessionId';
        return new SourceChangeSet(sessionId);
    }

    constructor(sessionId) {
        if (!sessionId) throw '!sessionId';
        this._sessionId = sessionId;
        this._prefix = "IDEChanges_" + this._sessionId;
        this._fireEvent();
    }

    async _fireEvent(){
        window.dispatchEvent(new CustomEvent(SourceChangeSet.SIZE_CHANGE, {detail: {sessionId: this._sessionId, stats: this.stats()}}));
    }

    _put(fileInfo, cmd){
        this._storage.setItem(this._key(fileInfo), JSON.stringify(cmd));
        this._fireEvent();
    }

    _putData(fileInfo, data){
        if (fileInfo.isText) {
            this._storage.setItem(this._keyData(fileInfo), _LZString.compress(data));
        } else {
            throw 'TODO base64 from arraybuffer';
        }
    }

    _clear(fileInfo){
        this._storage.removeItem(this._key(fileInfo));
        this._storage.removeItem(this._keyData(fileInfo));
    }

    get _storage(){
        return window.localStorage;
    }

    create(newFileInfo, data){
        const createPath = newFileInfo.path;
        if (this.all().filter((change)=>change.path === createPath || change.newPath === createPath)){
            throw 'exists: ' + createPath;
        }
        const cmd = {timestamp: Date.now(), path:createPath, type:SourceChangeSet.CREATE};
        this._put(newFileInfo, cmd);
        this._putData(newFileInfo, data);
    }

    /**
     * TODO this isn't right at all -- we should be storing it under the new path, or even in both places?
     */
    move(fileInfo, newPath){
        const existing = this._storage.getItem(this._key(fileInfo));

        if (existing){
            const cmd = JSON.parse(existing);
            if (cmd.type === SourceChangeSet.MOVE){
                cmd.newPath = newPath;
            } else if (existing.type === SourceChangeSet.CREATE) {
                cmd.path = newPath;
            } else if (existing.type === SourceChangeSet.UPDATE){
                cmd.newPath = newPath;
            } else {
                throw cmd.type;
            }
            cmd.timestamp = Date.now();
            this._put(fileInfo, cmd);
        } else {
            const cmd = {timestamp: Date.now(), id: fileInfo.id, version: fileInfo.version, type:SourceChangeSet.MOVE, newPath: newPath};
            this._put(fileInfo, cmd);
        }
    }

    /**
     * async due to frequency of updates possible on a single item,
     * and in case they are occurring while in the same thread as another action
     */
    async update(fileInfo, data){
        const existing = this._storage.getItem(this._key(fileInfo));

        if (existing){
            const cmd = JSON.parse(existing);
            if (cmd.type === SourceChangeSet.CREATE || cmd.type == SourceChangeSet.UPDATE){
                // For CREATE, we retain the original info, and ONLY update the data
                // (as though it had been created with this data originally)
                cmd.timestamp = Date.now();
                this._put(fileInfo, cmd);
                this._putData(fileInfo, data);
            } else if (cmd.type === SourceChangeSet.MOVE){
                // TODO promote to UPDATE with new path?
                throw 'TODO: update move';
            } else {
                throw cmd.type;
            }
        } else {
            const cmd = {timestamp: Date.now(), id: fileInfo.id, version: fileInfo.version, type:SourceChangeSet.UPDATE};
            this._put(fileInfo, cmd);
            this._putData(fileInfo, data);
        }
    }

    delete(fileInfo){
        if (fileInfo.id){
            const cmd = {timestamp: Date.now(), id: fileInfo.id, version: fileInfo.version, type:SourceChangeSet.DELETE, path: fileInfo.path};
            this._put(fileInfo, cmd);
        } else {
            this._clear(fileInfo);
        }
    }

    _keyForIdOrPath(path){
        return this._prefix + '_cmd_' + path;
    }

    _key(fileInfo){
        return this._keyForIdOrPath(fileInfo.id ? fileInfo.id : fileInfo.path);
    }

    _keyData(fileInfo){
        return this._prefix + '_data_' + (fileInfo.id ? fileInfo.id : fileInfo.path);
    }

    /**
     * @param sourceFile
     * @return {Response}
     */
    readExisting(sourceFile){
        if (sourceFile.isText){
            const data = this._storage.getItem(this._keyData(sourceFile));
            if (data){
                return new Response(_LZString.decompress(data), {status: 200, headers:{ 'Content-Type': 'text/plain'}});
            } else {
                return new Response(null, {status: 404});
            }
        } else {
            throw 'unsupported: binary'; // TODO see allowed body values for Response() constructor
        }
    }

    stats(){
        const pre = this._prefix + '_cmd_';

        let count = {
            create: 0,
            update: 0,
            //move: 0,
            delete: 0
        };

        for (let i = 0; i < this._storage.length; i++){
            const k = this._storage.key(i);
            if (!k.startsWith(pre)) continue;
            const cmd = JSON.parse(this._storage.getItem(k));
            switch (cmd.type){
                case SourceChangeSet.CREATE:{
                    count.create++; break;
                }
                case SourceChangeSet.UPDATE:
                case SourceChangeSet.MOVE:{
                    count.update++; break;
                }
                case SourceChangeSet.DELETE:{
                    count.delete++; break;
                }
            }
        }

        return count;
    }

    all(){
        const out = [];
        const pre = this._prefix + '_cmd_';
        for (let i = 0; i < this._storage.length; i++){
            const k = this._storage.key(i);
            if (k.startsWith(pre)) {
                out.push(JSON.parse(this._storage.getItem(k)));
            }
        }
        out.sort((a,b)=>a.timestamp - b.timestamp);
        return out;
    }
}

