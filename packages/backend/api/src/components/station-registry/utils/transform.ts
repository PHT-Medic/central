/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@authup/common';
import { StationRegistryEntity } from '../../../domains/special/station-registry/type';

export function transformStationRegistryResponse(data: Record<string, any>) : StationRegistryEntity[] {
    const { 'entity-list': entities } = data;

    if (!Array.isArray(entities)) {
        return [];
    }

    const items : StationRegistryEntity[] = [];

    for (let i = 0; i < entities.length; i++) {
        if (
            typeof entities[i] !== 'object' ||
            !hasOwnProperty(entities[i], 'id') ||
            typeof entities[i].id !== 'string' ||
            !hasOwnProperty(entities[i], 'name') ||
            typeof entities[i].name !== 'string'
        ) {
            continue;
        }

        const id = entities[i].id.split('/').pop();
        if (!id || id.length !== 36) {
            continue;
        }

        let realmId: string | undefined;

        if (
            hasOwnProperty(entities[i], 'link-list') &&
            Array.isArray(entities[i]['link-list'])
        ) {
            const linkItem : Record<string, any> | undefined = entities[i]['link-list'].filter(
                (link) => typeof link === 'object' &&
                    hasOwnProperty(link, 'name') &&
                    hasOwnProperty(link, 'uri') &&
                    link.name === 'organization',
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
