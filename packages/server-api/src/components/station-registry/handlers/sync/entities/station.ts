/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@authup/core';
import { Ecosystem } from '@personalhealthtrain/core';
import { useClient } from 'hapic';
import { In } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { ApiKey, useLogger } from '../../../../../config';
import { StationEntity } from '../../../../../domains';
import { transformStationRegistryResponse } from '../../../utils';

export async function syncStationsOfStationRegistry() {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);
    const response = await useClient(ApiKey.AACHEN_STATION_REGISTRY).get('stations');

    let externalEntities = transformStationRegistryResponse(response.data)
        .map((item) => repository.create({
            external_name: item.id,
            name: item.name,
            realm_id: item.realm_id,
            ecosystem: Ecosystem.PADME,
        }))
        .filter((item) => !!item.realm_id);

    useLogger()
        .info(
            `Read ${externalEntities.length} stations from the station-registry.`,
            { total: externalEntities.length },
        );

    const { data: stationPublicKeys } = await useClient(ApiKey.AACHEN_CENTRAL_SERVICE).get('stations/publickey');
    if (typeof stationPublicKeys === 'object') {
        for (let i = 0; i < externalEntities.length; i++) {
            if (
                hasOwnProperty(stationPublicKeys, externalEntities[i].external_name) &&
                typeof stationPublicKeys[externalEntities[i].external_name] === 'string'
            ) {
                externalEntities[i].public_key = Buffer.from(stationPublicKeys[externalEntities[i].external_name], 'base64')
                    .toString('hex');
            }
        }
    }

    externalEntities = externalEntities.map((item) => {
        item.external_name = item.external_name
            .toLowerCase()
            .replace(/-/g, '');

        return item;
    });

    const entities = await repository.findBy({
        external_name: In(externalEntities.map((item) => item.external_name)),
    });
    const entitiesExternalNames = entities.map((item) => item.external_name);

    const existing : StationEntity[] = [];
    const nonExisting : StationEntity[] = [];

    for (let i = 0; i < externalEntities.length; i++) {
        const index = entitiesExternalNames.indexOf(externalEntities[i].external_name);
        if (index === -1) {
            nonExisting.push(externalEntities[i]);
        } else {
            existing.push(repository.merge(entities[index], externalEntities[i]));
        }
    }

    if (nonExisting.length > 0) {
        await repository.save(nonExisting);

        useLogger()
            .info(
                `Created ${nonExisting.length} stations from the station-registry.`,
                { total: nonExisting.length },
            );
    }

    if (existing.length > 0) {
        await repository.save(existing);

        useLogger()
            .info(
                `Updated ${existing.length} stations from the station-registry.`,
                { total: existing.length },
            );
    }
}
