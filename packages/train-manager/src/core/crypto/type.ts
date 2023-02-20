/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { KeyLike } from 'node:crypto';

export type SignatureVerifyContext = {
    signature: Buffer | string,
    data: Buffer | string,
    key: KeyLike
};

export type SignatureCreateContext = {
    data: Buffer | string,
    key: KeyLike
};
