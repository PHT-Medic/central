/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    sign,
    verify,
} from 'crypto';
import { SignatureCreateContext, SignatureVerifyContext } from './type';

export function createSignature(context: SignatureCreateContext): string {
    let data : Buffer;
    if (typeof context.data === 'string') {
        data = Buffer.from(context.data, 'hex');
    } else {
        data = context.data;
    }

    const output = sign('SHA512', data, context.key);

    return output.toString('hex');
}

export function verifySignature(context: SignatureVerifyContext) : boolean {
    let signature : Buffer;
    if (typeof context.signature === 'string') {
        signature = Buffer.from(context.signature, 'hex');
    } else {
        signature = context.signature;
    }

    let data : Buffer;
    if (typeof context.data === 'string') {
        data = Buffer.from(context.data, 'hex');
    } else {
        data = context.data;
    }

    return verify('SHA512', data, context.key, signature);
}
