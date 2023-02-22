/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@personalhealthtrain/central-common';
import { MasterImageCommand } from '@personalhealthtrain/central-common';
import { dropTestDatabase, useTestDatabase } from '../../utils/database';
import { useSuperTest } from '../../utils/supertest';

describe('src/controllers/core/train-file', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let masterImage : MasterImage;
    let masterImageGroup : MasterImageGroup;

    it('sync with git repository', async () => {
        const response = await superTest
            .post('/master-images/command')
            .send({
                command: MasterImageCommand.SYNC,
            })
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();
        expect(response.body.groups).toBeDefined();
        expect(response.body.images).toBeDefined();
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/master-images')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toBeGreaterThan(0);

        // eslint-disable-next-line prefer-destructuring
        masterImage = response.body.data[0];
    });

    it('should read group collection', async () => {
        const response = await superTest
            .get('/master-image-groups')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toBeGreaterThan(0);

        // eslint-disable-next-line prefer-destructuring
        masterImageGroup = response.body.data[0];
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/master-images/${masterImage.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });

    it('should delete group resource', async () => {
        const response = await superTest
            .delete(`/master-image-groups/${masterImageGroup.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
