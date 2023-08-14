/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import { useClient } from 'hapic';
import { ApiKey, useLogger } from '../../../../../config';
import { useAuthupClient } from '../../../../../core';
import { transformStationRegistryResponse } from '../../../utils';

export async function syncOrganizationsOfStationRegistry() {
    const response = await useClient(ApiKey.AACHEN_STATION_REGISTRY).get('organizations');

    const entitiesExternal : Pick<Realm, 'name' | 'description'>[] = transformStationRegistryResponse(response.data)
        .map((item) => ({
            description: item.id,
            name: item.name,
        }));

    useLogger()
        .info(
            `Read ${entitiesExternal.length} realms from the station-registry.`,
            {
                total: entitiesExternal.length,
            },
        );

    const authupClient = useAuthupClient();
    const { data: entities } = await authupClient.realm.getMany({
        filter: {
            description: entitiesExternal.map((item) => item.description),
        },
    });

    const entitiesDescriptions = entities.map((item) => item.description);

    const existing : { id: Realm['id'], data: Partial<Realm> }[] = [];
    const nonExisting : Partial<Realm>[] = [];

    for (let i = 0; i < entitiesExternal.length; i++) {
        const index = entitiesDescriptions.indexOf(entitiesExternal[i].description);
        if (index === -1) {
            nonExisting.push(entitiesExternal[i]);
        } else {
            existing.push({
                id: entities[index].id,
                data: entitiesExternal[i],
            });
        }
    }

    if (nonExisting.length > 0) {
        for (let i = 0; i < nonExisting.length; i++) {
            await authupClient.realm.create(nonExisting[i]);
        }

        useLogger()
            .info(
                `Created ${nonExisting.length} realms from the station-registry.`,
                { total: nonExisting.length },
            );
    }

    if (existing.length > 0) {
        for (let i = 0; i < existing.length; i++) {
            await authupClient.realm.update(existing[i].id, existing[i].data);
        }

        useLogger()
            .info(
                `Updated ${existing.length} realms from the station-registry.`,
                { total: existing.length },
            );
    }
}
