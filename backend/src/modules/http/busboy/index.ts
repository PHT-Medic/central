import crypto from 'crypto';

export function buildMulterFileHandler() {
    const buffer : any[] = [];
    let fileSize = 0;
    let completed = false;

    const hash = crypto.createHash("sha256");

    const getBuffer = () => Buffer.concat(buffer, fileSize);

    return {
        pushBuffer(data: any) {
            if(completed) return;

            buffer.push(data);
            hash.update(data);

            fileSize += data.length;
        },
        getBuffer: getBuffer,

        //------------------------------------

        pushHash(data: any) {
            hash.update(data);
        },
        getHash() {
            return hash.digest('hex');
        },

        //------------------------------------

        getFileSize() {
            return fileSize;
        },
        pushFileSize(size: number) {
            fileSize += size;
        },

        //------------------------------------

        complete() {
            completed = true;
            return getBuffer();
        },
        cleanup() {
            completed = true;
        }
    }
}

export class UploadTimer {
    protected timer : any;
    /**
     * @constructor
     * @param {number} timeout - timer timeout in msecs.
     * @param {Function} callback - callback to run when timeout reached.
     */
    constructor(protected timeout: number = 0, protected callback : CallableFunction = () => {}) {
        this.timeout = timeout;
        this.callback = callback;
        this.timer = null;
    }

    clear() {
        clearTimeout(this.timer);
    }

    set() {
        // Do not start a timer if zero timeout or it hasn't been set.
        if (!this.timeout) return false;
        this.clear();
        this.timer = setTimeout(this.callback, this.timeout);
        return true;
    }
}
