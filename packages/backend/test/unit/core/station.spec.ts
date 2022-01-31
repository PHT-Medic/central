/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI,
    STATION_SECRET_ENGINE_KEY,
    Station,
    StationSecretStoragePayload, VaultAPI, buildRegistryStationProjectName,
} from '@personalhealthtrain/ui-common';
import { useClient } from '@trapi/client';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';
import { TEST_DEFAULT_STATION, createSuperTestStation } from '../../utils/domains/station';
import { ApiKey } from '../../../src/config/api';

describe('src/controllers/core/station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<Station> = {
        ...TEST_DEFAULT_STATION,
    };

    const secureId = details.secure_id;

    it('should create, read, update, delete resource and get collection', async () => {
        let publicKeyHex = Buffer.from(details.public_key, 'utf-8').toString('hex');
        let response = await createSuperTestStation(superTest, details);

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        let keys : string[] = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i] as keyof Station) {
                case 'public_key':
                    expect(response.body[keys[i]]).toEqual(publicKeyHex);
                    break;
                default:
                    expect(response.body[keys[i]]).toEqual(details[keys[i]]);
                    break;
            }
        }

        const entityId = response.body.id;

        // ---------------------------------------------------------

        let stationSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, secureId);

        expect(stationSecret.data).toBeDefined();
        expect(stationSecret.data.rsa_public_key).toEqual(publicKeyHex);
        expect(stationSecret.data.registry_robot_name).toEqual(`robot$${buildRegistryStationProjectName(secureId)}`);
        expect(stationSecret.data.registry_robot_id).toBeDefined();
        expect(stationSecret.data.registry_robot_secret).toBeDefined();

        let registryProject = await useClient<HarborAPI>(ApiKey.HARBOR).project
            .find(buildRegistryStationProjectName(secureId), true);

        expect(registryProject).toBeDefined();
        expect(registryProject.id).toBeDefined();
        expect(registryProject.name).toEqual(buildRegistryStationProjectName(secureId));

        let registryRobotAccount = await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
            .find(buildRegistryStationProjectName(secureId));

        expect(registryRobotAccount).toBeDefined();
        expect(registryRobotAccount.id).toBeDefined();
        expect(registryRobotAccount.name).toEqual(`robot$${buildRegistryStationProjectName(secureId)}`);

        // ---------------------------------------------------------

        response = await superTest
            .get('/stations')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(4);

        // ---------------------------------------------------------

        response = await superTest
            .get(`/stations/${entityId}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.name = 'TestA';
        details.public_key = 'baz-bar-foo';
        publicKeyHex = Buffer.from(details.public_key, 'utf-8').toString('hex');

        response = await superTest
            .post(`/stations/${entityId}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        keys = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i] as keyof Station) {
                case 'public_key':
                    expect(response.body[keys[i]]).toEqual(publicKeyHex);
                    break;
                default:
                    expect(response.body[keys[i]]).toEqual(details[keys[i]]);
                    break;
            }
        }

        // ---------------------------------------------------------

        stationSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, secureId);

        expect(stationSecret.data).toBeDefined();
        expect(stationSecret.data.rsa_public_key).toEqual(publicKeyHex);

        // ---------------------------------------------------------

        response = await superTest
            .delete(`/stations/${entityId}`)
            .auth('admin', 'start123');
        expect(response.status).toEqual(200);

        // ---------------------------------------------------------

        stationSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, secureId);
        expect(stationSecret).toBeUndefined();

        registryProject = await useClient<HarborAPI>(ApiKey.HARBOR).project
            .find(buildRegistryStationProjectName(secureId), true);
        expect(registryProject).toBeUndefined();

        registryRobotAccount = await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
            .find(buildRegistryStationProjectName(secureId));
        expect(registryRobotAccount).toBeUndefined();
    });
});
