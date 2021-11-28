/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MASTER_REALM_ID } from '@personalhealthtrain/ui-common';
import { buildConnectionOptions } from 'typeorm-extension';
import { createConnection, getConnection } from 'typeorm';
import { useSuperTest } from '../../supertest';

describe('src/app/auth/realms', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        const connectionOptions = await buildConnectionOptions();
        await createConnection(connectionOptions);
    });

    afterAll(async () => {
        await getConnection().close();
    });

    it('should get collection', async () => {
        const response = await superTest
            .get('/realms');

        expect(response.body).toBeDefined();
        expect(response.status).toEqual(200);
    });

    it('should get single resource', async () => {
        const response = await superTest
            .get(`/realms/${MASTER_REALM_ID}`);

        expect(response.body).toBeDefined();
        expect(response.body.id).toEqual(MASTER_REALM_ID);
        expect(response.body.drop_able).toEqual(false);
        expect(response.status).toEqual(200);
    });

    it('should create, update and delete resource', () => {
        // todo: endpoint testing
    });
});
