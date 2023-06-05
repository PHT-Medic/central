/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@personalhealthtrain/central-common';
import type { RegistryProjectVaultPayload } from './type';

export function isRegistryProjectVaultPayload(
    input: unknown,
) : input is RegistryProjectVaultPayload {
    if (!isObject(input)) {
        return false;
    }

    const {
        account_id: accountId,
        account_name: accountName,
        account_secret: accountSecret,
    } = input as RegistryProjectVaultPayload;

    return typeof accountId === 'string' &&
        typeof accountName === 'string' &&
        typeof accountSecret === 'string';
}
