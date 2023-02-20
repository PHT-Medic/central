/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train, TrainType } from '@personalhealthtrain/central-common';
import { removeDateProperties } from '../../../utils/date-properties';
import { useSuperTest } from '../../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database';
import { TEST_DEFAULT_TRAIN, createSuperTestProposal, createSuperTestTrain } from '../../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../../utils/properties';
import { buildRequestValidationErrorMessage } from '../../../../src/http/validation';

describe('src/controllers/core/train', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : Train;

    it('should create resource', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const response = await createSuperTestTrain(superTest, {
            ...TEST_DEFAULT_TRAIN,
            proposal_id: proposal.body.id,
        });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.proposal_id).toEqual(proposal.body.id);

        details = removeDateProperties(response.body);
    });

    it('should get collection', async () => {
        const response = await superTest
            .get('/trains')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/trains/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.name = 'TestA';

        const response = await superTest
            .post(`/trains/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/trains/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });

    it('should not create resource with invalid parameters', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: proposal.body.id,
            type: 'xyz' as TrainType,
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildRequestValidationErrorMessage<Train>(['type']));
    });

    it('should not create resource with invalid proposal', async () => {
        const response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildRequestValidationErrorMessage<Train>(['proposal_id']));
    });

    it('should not create resource with invalid master-image', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: proposal.body.id,
            master_image_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildRequestValidationErrorMessage<Train>(['master_image_id']));
    });
});
