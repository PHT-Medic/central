/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@authup/common';

export function buildSocketRealmNamespaceName(realmId: Realm['id']) {
    return `/realm#${realmId}`;
}

export function parseSocketRealmNamespaceName(name: string) : string | undefined {
    return name.startsWith('/realm#') ?
        name.substring('/realm#'.length) :
        name;
}
