/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import crypto from 'node:crypto';

export function decryptSymmetric(key: Buffer, data: Buffer, ivLength = 16): Buffer {
    const iv = data.slice(0, ivLength);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.write(data.slice(ivLength));
    decipher.end();

    return decipher.read();
}

export function encryptSymmetric(key: Buffer, iv: Buffer, data: string | Buffer) : Buffer {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.write(data);
    cipher.end();

    const encrypted = cipher.read();

    return Buffer.concat([iv, encrypted]);
}
