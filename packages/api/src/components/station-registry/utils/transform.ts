/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'locter';
import type { StationRegistryEntity } from '../type';

export function transformStationRegistryResponse(data: Record<string, any>) : StationRegistryEntity[] {
    const { 'entity-list': entities } = data;

    if (!Array.isArray(entities)) {
        return [];
    }

    const items : StationRegistryEntity[] = [];

    for (let i = 0; i < entities.length; i++) {
        if (
            !isObject(entities[i]) ||
            typeof entities[i].id !== 'string' ||
            typeof entities[i].name !== 'string'
        ) {
            continue;
        }

        const id = entities[i].id.split('/').pop();
        if (!id || id.length !== 36) {
            continue;
        }

        let realmId: string | undefined;

        if (Array.isArray(entities[i]['link-list'])) {
            const linkItem : undefined | { name: string, uri: string } = entities[i]['link-list'].filter(
                (link) => typeof link === 'object' &&
                    link.name === 'organization' &&
                    typeof link.uri === 'string',
            ).pop();

            if (linkItem) {
                const id = linkItem.uri.split('/').pop();
                if (id && id.length === 36) {
                    realmId = id;
                }
            }
        }

        items.push({
            id,
            name: entities[i].name,
            ...(realmId ? { realm_id: realmId } : {}),
        });
    }

    return items;
}
