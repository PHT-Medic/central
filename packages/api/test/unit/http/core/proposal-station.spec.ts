/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProposalStation } from '@personalhealthtrain/central-common';
import { useSuperTest } from '../../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { createSuperTestProposal } from '../../../utils/domains/proposal';
import { createSuperTestStation } from '../../../utils/domains/station';
import { expectPropertiesEqualToSrc } from '../../../utils/properties';

describe('src/controllers/core/proposal-station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    it('should create, read, update, delete resource & get collection', async () => {
        const proposal = await createSuperTestProposal(superTest);
        const station = await createSuperTestStation(superTest);

        const details : Partial<ProposalStation> = {
            proposal_id: proposal.body.id,
            station_id: station.body.id,
        };

        let response = await superTest
            .post('/proposal-stations')
            .auth('admin', 'start123')
            .send(details);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expectPropertiesEqualToSrc(details, response.body);

        // ---------------------------------------------------------

        const collectionResponse = await superTest
            .get('/proposal-stations')
            .auth('admin', 'start123');

        expect(collectionResponse.status).toEqual(200);
        expect(collectionResponse.body).toBeDefined();
        expect(collectionResponse.body.data).toBeDefined();
        expect(collectionResponse.body.data.length).toEqual(1);

        // ---------------------------------------------------------

        response = await superTest
            .get(`/proposal-stations/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        // ---------------------------------------------------------

        response = await superTest
            .delete(`/proposal-stations/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
