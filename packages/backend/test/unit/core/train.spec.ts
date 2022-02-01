/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretType, Train, TrainType } from '@personalhealthtrain/ui-common';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';
import { TEST_DEFAULT_TRAIN, createSuperTestTrain } from '../../utils/domains/train';
import { createSuperTestProposal } from '../../utils/domains/proposal';
import { expectPropertiesEqualToSrc } from '../../utils/properties';
import { buildExpressValidationErrorMessage } from '../../../src/http/error/validation';

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

    fit('should not create resource with invalid parameters', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: proposal.body.id,
            type: 'xyz' as TrainType,
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildExpressValidationErrorMessage<Train>(['type']));
    });

    it('should not create resource with invalid proposal', async () => {
        let response = await createSuperTestTrain(superTest, {
            ...details,
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildExpressValidationErrorMessage<Train>(['proposal_id']));

        response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildExpressValidationErrorMessage<Train>(['proposal_id']));
    });

    it('should not create resource with invalid master-image', async () => {
        const proposal = await createSuperTestProposal(superTest);

        let response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: proposal.body.id,
            master_image_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildExpressValidationErrorMessage<Train>(['master_image_id']));

        response = await createSuperTestTrain(superTest, {
            ...details,
            proposal_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
            master_image_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildExpressValidationErrorMessage<Train>(['master_image_id', 'proposal_id']));
    });
});
