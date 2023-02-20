/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from './entity';

export function buildRegistryClientConnectionStringFromRegistry(entity: Registry) {
    // todo: support other registries beside harbor and v2.0

    const url = `https://${entity.host}/api/v2.0/`;
    return `${entity.account_name}:${entity.account_secret}@${url}`;
}
