/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    UserSecret,
    UserSecretsSecretStoragePayload,
} from '@personalhealthtrain/central-common';
import {
    SecretType,
    USER_SECRETS_SECRET_ENGINE_KEY,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import type { Client as VaultClient } from '@hapic/vault';
import { removeDateProperties } from '../../utils/date-properties';
import { expectPropertiesEqualToSrc } from '../../utils/properties';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database';
import { ApiKey } from '../../../src';

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
        const userResponse = await superTest
            .get('/users/admin')
            .auth('admin', 'start123');

        expect(userResponse.statusCode).toEqual(200);
        expect(userResponse.body).toBeDefined();

        const user = userResponse.body;

        const response = await superTest
            .post('/user-secrets')
            .auth('admin', 'start123')
            .send({
                key: SecretType.RSA_PUBLIC_KEY,
                content: 'foo-bar-baz',
                type: SecretType.RSA_PUBLIC_KEY,
                user_id: user.id,
            });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = removeDateProperties(response.body);
    });

    it('should find vault entry', async () => {
        const userSecret = await useClient<VaultClient>(ApiKey.VAULT).keyValue
            .find<UserSecretsSecretStoragePayload>(USER_SECRETS_SECRET_ENGINE_KEY, details.user_id);

        expect(userSecret.data).toBeDefined();
        expect(userSecret.data).toHaveProperty(details.id);
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

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/user-secrets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });

    it('should not find vault entry', async () => {
        const userSecret = await useClient<VaultClient>(ApiKey.VAULT).keyValue
            .find<UserSecretsSecretStoragePayload>(USER_SECRETS_SECRET_ENGINE_KEY, details.user_id);

        expect(userSecret).toBeUndefined();
    });
});
