/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { VaultKVOptions } from '../key-value';

export type VaultMountPayload = {
    path: string,
    type: 'kv',
    description?: string,
    config: Record<string, any>,
    generate_signing_key?: boolean,
    options: VaultKVOptions,
};
