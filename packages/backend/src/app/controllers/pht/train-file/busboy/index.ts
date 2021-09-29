/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import crypto from 'crypto';

export function buildMulterFileHandler() {
    const buffer : any[] = [];
    let fileSize : number = 0;
    let completed : boolean = false;

    const hash = crypto.createHash("sha256");

    const getBuffer = () => Buffer.concat(buffer, fileSize);

    return {
        pushBuffer(data: any) {
            if(completed) return;

            buffer.push(data);
            hash.update(data);

            fileSize += data.length;
        },
        getBuffer,

        // ------------------------------------

        pushHash(data: any) {
            hash.update(data);
        },
        getHash() {
            return hash.digest('hex');
        },

        // ------------------------------------

        getFileSize() {
            return fileSize;
        },
        pushFileSize(size: number) {
            fileSize += size;
        },

        // ------------------------------------

        complete() {
            completed = true;
            return getBuffer();
        },
        cleanup() {
            completed = true;
        }
    }
}
