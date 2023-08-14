/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Proposal } from '@personalhealthtrain/core';
import { removeDateProperties } from '../../utils/date-properties';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database';
import { createSuperTestProposal } from '../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../utils/properties';

describe('src/controllers/core/proposal', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : Proposal;

    it('should create resource', async () => {
        const response = await createSuperTestProposal(superTest);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.trains).toEqual(0);

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/proposals')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/proposals/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.title = 'TestA';

        const response = await superTest
            .post(`/proposals/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/proposals/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
