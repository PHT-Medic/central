/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import crypto from 'node:crypto';
import {
    createSignature,
    decryptSymmetric,
    encryptSymmetric,
    generateRSAKeyPair,
    verifySignature,
} from '../../src/core';

describe('src/core/crypto', () => {
    it('should create & verify signature', async () => {
        const { privateKey: key } = await generateRSAKeyPair();

        const data = crypto.randomBytes(32);
        const signature = createSignature({ data, key });

        const verified = verifySignature({ data, key, signature });

        expect(verified).toBeTruthy();
    });

    it('should asymmetric encrypt & decrypt symmetric key', async () => {
        const keyPair = await generateRSAKeyPair();

        const symmetricKey = crypto.randomBytes(32);

        const symmetricKeyEncrypted = crypto.publicEncrypt(keyPair.publicKey, symmetricKey);

        const symmetricKeyDecrypted = crypto.privateDecrypt(keyPair.privateKey, symmetricKeyEncrypted);

        expect(symmetricKeyDecrypted).toEqual(symmetricKey);
    });

    it('should symmetric encrypt & decrypt buffer', async () => {
        const symmetricKey = crypto.randomBytes(32);
        const symmetricKeyIv = crypto.randomBytes(16);

        const buff = crypto.randomBytes(128);

        const symmetricEncrypted = encryptSymmetric(symmetricKey, symmetricKeyIv, buff);
        const symmetricDecrypted = decryptSymmetric(symmetricKey, symmetricEncrypted);

        expect(symmetricDecrypted).toEqual(buff);
    });
});
