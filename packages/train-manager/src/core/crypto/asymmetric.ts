/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import crypto from 'node:crypto';

export async function generateRSAKeyPair() : Promise<{privateKey: string, publicKey: string}> {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
        }, (err: (Error | null), publicKey: string, privateKey: string) => {
            if (err) reject(err);

            resolve({
                privateKey,
                publicKey,
            });
        });
    });
}
