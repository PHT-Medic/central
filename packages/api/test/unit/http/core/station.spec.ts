/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Station,
} from '@personalhealthtrain/central-common';
import { useSuperTest } from '../../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { createSuperTestStation } from '../../../utils/domains';

function expectPropertiesEqualToSrc(
    src: Record<string, any>,
    dest: Record<string, any>,
) {
    const keys : string[] = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
        switch (keys[i] as keyof Station) {
            case 'public_key':
                expect(dest[keys[i]]).toEqual(Buffer.from(src.public_key, 'utf-8').toString('hex'));
                break;
            default:
                expect(dest[keys[i]]).toEqual(src[keys[i]]);
                break;
        }
    }
}

describe('src/controllers/core/station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details: Station;

    // fix test :)

    it('should create station', async () => {
        const response = await createSuperTestStation(superTest, details);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/stations')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.name = 'TestA';
        details.public_key = 'baz-bar-foo';

        const response = await superTest
            .post(`/stations/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/stations/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
