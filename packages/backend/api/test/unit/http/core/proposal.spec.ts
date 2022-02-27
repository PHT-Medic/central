/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Proposal } from '@personalhealthtrain/central-common';
import { useSuperTest } from '../../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { TEST_DEFAULT_PROPOSAL, createSuperTestProposal } from '../../../utils/domains/proposal';
import { expectPropertiesEqualToSrc } from '../../../utils/properties';

describe('src/controllers/core/proposal', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<Proposal> = {
        ...TEST_DEFAULT_PROPOSAL,
    };

    it('should get collection', async () => {
        const response = await superTest
            .get('/proposals')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(0);
    });

    it('should create, read, update, delete resource', async () => {
        let response = await createSuperTestProposal(superTest, details);

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.trains).toEqual(0);
        expectPropertiesEqualToSrc(details, response.body);

        // ---------------------------------------------------------

        response = await superTest
            .get(`/proposals/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.title = 'TestA';

        response = await superTest
            .post(`/proposals/${response.body.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expectPropertiesEqualToSrc(details, response.body);

        // ---------------------------------------------------------

        response = await superTest
            .delete(`/proposals/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
    });
});
