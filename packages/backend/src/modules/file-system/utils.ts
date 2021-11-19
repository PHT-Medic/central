/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function ensureDirectoryExists(path: string) {
    try {
        await fs.promises.stat(path);
        await fs.promises.chmod(path, 0o775);
    } catch (e) {
        await fs.promises.mkdir(path, {
            mode: 0o775
        });
    }
}

export function createFileStreamHandler(destinationFilePath: string) {
    const hash = crypto.createHash('md5');
    let fileSize = 0;
    let completed = false;

    const writeStream = fs.createWriteStream(destinationFilePath);
    const writePromise = new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => {
            reject(err);
        });
    });

    return {
        add: (data) : void => {
            if (completed === true) {
                return;
            }

            writeStream.write(data);
            hash.update(data);
            fileSize += data.length;
        },
        getFilePath: () : string => destinationFilePath,
        getFileSize: () : number => fileSize,
        getHash: () : string => hash.digest('hex'),
        complete: () : Buffer => {
            completed = true;

            writeStream.end();

            return Buffer.concat([]);
        },
        cleanup: async () => {
            completed = true;
            writeStream.end();

            try {
                await fs.promises.access(destinationFilePath, fs.constants.W_OK);
                await fs.promises.unlink(destinationFilePath);
            } catch (e) {
                console.log(e);
            }
        },
        getWritePromise: () => writePromise
    };
}
