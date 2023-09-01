/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    UserSecret,
} from '@personalhealthtrain/core';
import {
    SecretType,
} from '@personalhealthtrain/core';
import { createUserSecretHash } from '../../../src/domains';
import {
    dropTestDatabase,
    expectPropertiesEqualToSrc,
    removeDateProperties,
    useSuperTest,
    useTestDatabase,
} from '../../utils';

describe('src/controllers/core/user-secret', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : UserSecret;

    it('should create resource', async () => {
        const response = await superTest
            .post('/user-secrets')
            .auth('admin', 'start123')
            .send({
                key: SecretType.RSA_PUBLIC_KEY,
                content: 'foo-bar-baz',
                type: SecretType.RSA_PUBLIC_KEY,
            });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/user-secrets')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/user-secrets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.content = 'baz-bar-foo';

        const response = await superTest
            .post(`/user-secrets/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        details.content = Buffer.from(details.content, 'utf-8').toString('hex');
        details.hash = createUserSecretHash(details.content);

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/user-secrets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
