/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { useClient } from 'hapic';
import { In } from 'typeorm';
import { RealmEntity } from '@authup/server-database';
import { hasOwnProperty } from '@authup/common';
import { Ecosystem } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { StationEntity } from '../../../domains/core/station';
import { ApiKey, useLogger } from '../../../config';
import { transformStationRegistryResponse } from '../utils/transform';
import { buildSecretStorageQueueMessage } from '../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../domains/special/secret-storage/constants';

export async function syncStationRegistry() {
    const dataSource = await useDataSource();
    const realmRepository = dataSource.getRepository(RealmEntity);

    let response = await useClient(ApiKey.AACHEN_STATION_REGISTRY).get('organizations');

    const externalRealms = transformStationRegistryResponse(response.data)
        .map((item) => realmRepository.create({
            id: item.id,
            name: item.name,
        }));

    useLogger()
        .info(
            `Read ${externalRealms.length} realms from the station-registry.`,
            {
                total: externalRealms.length,
            },
        );

    // todo: use description -> id

    const realms = await realmRepository.findBy({
        id: In(externalRealms.map((item) => item.id)),
    });
    const realmIds = realms.map((item) => item.id);

    const existingExternalRealms : RealmEntity[] = [];
    const nonExistingExternalRealms : RealmEntity[] = [];

    for (let i = 0; i < externalRealms.length; i++) {
        const index = realmIds.indexOf(externalRealms[i].id);
        if (index === -1) {
            nonExistingExternalRealms.push(externalRealms[i]);
        } else {
            existingExternalRealms.push(realmRepository.merge(
                realms[index],
                externalRealms[i],
            ));
        }
    }

    if (nonExistingExternalRealms.length > 0) {
        await realmRepository.save(nonExistingExternalRealms);

        useLogger()
            .info(
                `Created ${nonExistingExternalRealms.length} realms from the station-registry.`,
                { total: nonExistingExternalRealms.length },
            );
    }

    if (existingExternalRealms.length > 0) {
        await realmRepository.save(existingExternalRealms);

        useLogger()
            .info(
                `Updated ${existingExternalRealms.length} realms from the station-registry.`,
                { total: existingExternalRealms.length },
            );
    }

    // -------------------------------------------------------------------------

    const stationRepository = dataSource.getRepository(StationEntity);
    response = await useClient(ApiKey.AACHEN_STATION_REGISTRY).get('stations');

    let externalStations = transformStationRegistryResponse(response.data)
        .map((item) => stationRepository.create({
            external_name: item.id,
            name: item.name,
            realm_id: item.realm_id,
            ecosystem: Ecosystem.PADME,
        }))
        .filter((item) => !!item.realm_id);

    useLogger()
        .info(
            `Read ${externalStations.length} stations from the station-registry.`,
            { total: externalStations.length },
        );

    const { data: stationPublicKeys } = await useClient(ApiKey.AACHEN_CENTRAL_SERVICE).get('stations/publickey');
    if (typeof stationPublicKeys === 'object') {
        for (let i = 0; i < externalStations.length; i++) {
            if (
                hasOwnProperty(stationPublicKeys, externalStations[i].external_name) &&
                typeof stationPublicKeys[externalStations[i].external_name] === 'string'
            ) {
                externalStations[i].public_key = Buffer.from(stationPublicKeys[externalStations[i].external_name], 'base64')
                    .toString('hex');
            }
        }
    }

    externalStations = externalStations.map((item) => {
        item.external_name = item.external_name
            .toLowerCase()
            .replaceAll('-', '');

        return item;
    });

    const stations = await stationRepository.findBy({
        external_name: In(externalStations.map((item) => item.external_name)),
    });
    const stationSecureIds = stations.map((item) => item.external_name);

    const existingExternalStations : StationEntity[] = [];
    const nonExistingExternalStations : StationEntity[] = [];

    for (let i = 0; i < externalStations.length; i++) {
        const index = stationSecureIds.indexOf(externalStations[i].external_name);
        if (index === -1) {
            nonExistingExternalStations.push(externalStations[i]);
        } else {
            existingExternalStations.push(stationRepository.merge(stations[index], externalStations[i]));
        }
    }

    if (nonExistingExternalStations.length > 0) {
        await stationRepository.save(nonExistingExternalStations);

        useLogger()
            .info(
                `Created ${nonExistingExternalStations.length} stations from the station-registry.`,
                { total: nonExistingExternalStations.length },
            );
    }

    if (existingExternalStations.length > 0) {
        await stationRepository.save(existingExternalStations);

        useLogger()
            .info(
                `Updated ${existingExternalStations.length} stations from the station-registry.`,
                { total: existingExternalStations.length },
            );
    }

    externalStations = [...existingExternalStations, ...nonExistingExternalStations];

    for (let i = 0; i < externalStations.length; i++) {
        const queueMessage = buildSecretStorageQueueMessage(
            SecretStorageQueueCommand.SAVE,
            {
                type: SecretStorageQueueEntityType.STATION,
                id: externalStations[i].id,
            },
        );

        await publish(queueMessage);
    }
}
