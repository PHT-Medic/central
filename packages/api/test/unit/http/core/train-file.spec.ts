/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Proposal, Train, TrainFile } from '@personalhealthtrain/central-common';
import path from 'node:path';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { createSuperTestProposal, createSuperTestTrain } from '../../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../../utils/properties';
import { useSuperTest } from '../../../utils/supertest';

describe('src/controllers/core/train-file', () => {
    const superTest = useSuperTest();

    let proposal: Proposal;
    let train: Train;

    beforeAll(async () => {
        await useTestDatabase();

        let response = await createSuperTestProposal(superTest);
        proposal = response.body;

        response = await createSuperTestTrain(superTest, {
            proposal_id: proposal.id,
        });

        train = response.body;
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details: TrainFile;

    it('should create resource', async () => {
        const filePath = path.join(__dirname, '..', '..', 'data', 'train.py');
        const response = await superTest.post(`/trains/${train.id}/files`)
            .set('Accept', 'application/json')
            .set('Connection', 'keep-alive')
            .attach('file[0]', filePath)
            .auth('admin', 'start123');

        expect(response.statusCode).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.meta).toBeDefined();
        expect(response.body.meta.total).toEqual(1);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(1);

        // eslint-disable-next-line prefer-destructuring
        details = (response.body.data as any[])[0];
    });

    it('should get collection', async () => {
        const response = await superTest
            .get(`/trains/${train.id}/files`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/trains/${train.id}/files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/trains/${train.id}/files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
