/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Registry } from './entity';

export function buildConnectionStringFromRegistry(entity: Registry) {
    // ensure /api/v2.0/ is represent
    return `${entity.account_name}:${entity.account_secret}@${entity.address}`;
}
