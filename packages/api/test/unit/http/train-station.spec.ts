/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainStation } from '@personalhealthtrain/central-common';
import { removeDateProperties } from '../../utils/date-properties';
import { expectPropertiesEqualToSrc } from '../../utils/properties';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database';
import {
    createSuperTestProposal,
    createSuperTestProposalStation,
    createSuperTestStation,
    createSuperTestTrain,
} from '../../utils/domains';

describe('src/controllers/core/train-station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : TrainStation;

    it('should create resource', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const station = await createSuperTestStation(superTest);

        await createSuperTestProposalStation(superTest, {
            station_id: station.body.id,
            proposal_id: proposal.body.id,
        });

        const train = await createSuperTestTrain(superTest, {
            proposal_id: proposal.body.id,
        });

        const response = await superTest
            .post('/train-stations')
            .auth('admin', 'start123')
            .send({
                train_id: train.body.id,
                station_id: station.body.id,
            });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        delete response.body.train;
        delete response.body.station;

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/train-stations')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/train-stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/train-stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
