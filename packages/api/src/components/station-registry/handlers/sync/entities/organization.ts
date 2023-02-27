/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/common';
import { RealmEntity } from '@authup/server-database';
import { useClient } from 'hapic';
import { In } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { ApiKey, useLogger } from '../../../../../config';
import { transformStationRegistryResponse } from '../../../utils';

export async function syncOrganizationsOfStationRegistry() {
    const dataSource = await useDataSource();
    const realmRepository = dataSource.getRepository(RealmEntity);

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

    const entities = await realmRepository.findBy({
        description: In(entitiesExternal.map((item) => item.description)),
    });
    const entitiesDescriptions = entities.map((item) => item.description);

    const existing : RealmEntity[] = [];
    const nonExisting : RealmEntity[] = [];

    for (let i = 0; i < entitiesExternal.length; i++) {
        const index = entitiesDescriptions.indexOf(entitiesExternal[i].description);
        if (index === -1) {
            nonExisting.push(realmRepository.create(entitiesExternal[i]));
        } else {
            existing.push(realmRepository.merge(
                entities[index],
                entitiesExternal[i],
            ));
        }
    }

    if (nonExisting.length > 0) {
        await realmRepository.save(nonExisting);

        useLogger()
            .info(
                `Created ${nonExisting.length} realms from the station-registry.`,
                { total: nonExisting.length },
            );
    }

    if (existing.length > 0) {
        await realmRepository.save(existing);

        useLogger()
            .info(
                `Updated ${existing.length} realms from the station-registry.`,
                { total: existing.length },
            );
    }
}
