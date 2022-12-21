/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Station,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { Client as HarborClient } from '@hapic/harbor';
import { useSuperTest } from '../../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { TEST_DEFAULT_STATION, createSuperTestStation } from '../../../utils/domains/station';
import { ApiKey } from '../../../../src/config';

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

    // fix test :)

    const externalName = details.external_name;

    it('should create, read, update, delete resource and get collection', async () => {
        let publicKeyHex = Buffer.from(details.public_key, 'utf-8').toString('hex');
        let response = await createSuperTestStation(superTest, details);

        expect(response.status).toEqual(201);
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

        let registryProject = await useClient<HarborClient>(ApiKey.HARBOR).project
            .getOne(externalName, true);

        expect(registryProject).toBeDefined();
        expect(registryProject.project_id).toBeDefined();
        expect(registryProject.name).toEqual(externalName);

        let registryRobotAccount = await useClient<HarborClient>(ApiKey.HARBOR).robotAccount
            .find(externalName);

        expect(registryRobotAccount).toBeDefined();
        expect(registryRobotAccount.id).toBeDefined();
        expect(registryRobotAccount.name).toEqual(`robot$${externalName}`);

        // ---------------------------------------------------------

        response = await superTest
            .get('/stations')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);

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

        expect(response.status).toEqual(202);
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

        response = await superTest
            .delete(`/stations/${entityId}`)
            .auth('admin', 'start123');
        expect(response.status).toEqual(202);

        // ---------------------------------------------------------

        registryProject = await useClient<HarborClient>(ApiKey.HARBOR).project
            .getOne(externalName, true);
        expect(registryProject).toBeUndefined();

        registryRobotAccount = await useClient<HarborClient>(ApiKey.HARBOR).robotAccount
            .find(externalName);
        expect(registryRobotAccount).toBeUndefined();
    });
});
