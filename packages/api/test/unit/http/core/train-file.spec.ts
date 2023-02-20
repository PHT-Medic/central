/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainFile } from '@personalhealthtrain/central-common';
import path from 'node:path';
import tar from 'tar-stream';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database';
import { createSuperTestProposal, createSuperTestTrain } from '../../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../../utils/properties';
import { useSuperTest } from '../../../utils/supertest';

describe('src/controllers/core/train-file', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details: TrainFile;

    it('should create resource', async () => {
        const { body: proposal } = await createSuperTestProposal(superTest);
        const { body: train } = await createSuperTestTrain(superTest, {
            proposal_id: proposal.id,
        });

        const filePath = path.join(__dirname, '..', '..', 'data', 'train.py');
        const response = await superTest.post('/train-files')
            .set('Accept', 'application/json')
            .set('Connection', 'keep-alive')
            .field('train_id', train.id)
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
            .get('/train-files')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/train-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should files by train', (done) => {
        const extract = tar.extract();

        const headers : Record<string, any>[] = [];

        extract.on('entry', async (header, stream, callback) => {
            headers.push(header);

            callback();
        });

        extract.on('finish', () => {
            expect(headers.length).toBeGreaterThanOrEqual(1);
            done();
        });

        superTest
            .get(`/trains/${details.train_id}/files/download`)
            .auth('admin', 'start123')
            .pipe(extract);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/train-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
