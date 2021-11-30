/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretType, UserSecret } from '@personalhealthtrain/ui-common';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';

describe('src/app/auth/user-secret', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<UserSecret> = {
        content: 'xxx',
        user_id: 1,
        type: SecretType.RSA_PUBLIC_KEY,
    };

    it('should read collection', async () => {
        const response = await superTest
            .get('/user-secrets')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(0);
    });

    it('should create, read, update, delete resource', async () => {
        let response = await superTest
            .post('/user-secrets')
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        let keys : string[] = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            expect(response.body[keys[i]]).toEqual(details[keys[i]]);
        }

        // ---------------------------------------------------------

        response = await superTest
            .get(`/user-secrets/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.content = 'TestA';

        response = await superTest
            .post(`/user-secrets/${response.body.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        keys = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            expect(response.body[keys[i]]).toEqual(details[keys[i]]);
        }

        // ---------------------------------------------------------

        response = await superTest
            .delete(`/user-secrets/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
    });
});
