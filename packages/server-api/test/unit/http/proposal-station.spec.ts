/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProposalStation } from '@personalhealthtrain/core';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database';
import { createSuperTestProposal, createSuperTestStation } from '../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../utils/properties';

describe('src/controllers/core/proposal-station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : ProposalStation;

    it('should create resource', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const station = await createSuperTestStation(superTest);

        const response = await superTest
            .post('/proposal-stations')
            .auth('admin', 'start123')
            .send({
                proposal_id: proposal.body.id,
                station_id: station.body.id,
            });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = response.body;
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/proposal-stations')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/proposal-stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/proposal-stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
