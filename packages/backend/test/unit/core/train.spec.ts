/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Proposal, Train } from '@personalhealthtrain/ui-common';
import { MASTER_REALM_ID } from '@typescript-auth/domains';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';
import { TEST_DEFAULT_TRAIN, createSuperTestTrain } from '../../utils/domains/train';
import { createSuperTestProposal } from '../../utils/domains/proposal';
import { expectPropertiesEqualToSrc } from '../../utils/properties';

describe('src/controllers/core/train', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<Train> = {
        ...TEST_DEFAULT_TRAIN,
    };

    it('should get collection', async () => {
        const response = await superTest
            .get('/trains')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(0);
    });

    it('should create, read, update, delete resource', async () => {
        const proposal = await createSuperTestProposal(superTest);
        let response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: proposal.body.id,
        });

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.proposal_id).toEqual(proposal.body.id);
        expectPropertiesEqualToSrc(details, response.body);

        // ---------------------------------------------------------

        response = await superTest
            .get(`/trains/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.name = 'TestA';

        response = await superTest
            .post(`/trains/${response.body.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expectPropertiesEqualToSrc(details, response.body);

        // ---------------------------------------------------------

        response = await superTest
            .delete(`/trains/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
    });
});
