/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    SecretType,
    USER_SECRETS_SECRET_ENGINE_KEY,
    UserSecret,
    UserSecretsSecretStoragePayload,
    VaultAPI,
} from '@personalhealthtrain/ui-common';
import { useClient } from '@trapi/client';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';
import { ApiKey } from '../../../src/config/api';

describe('src/controllers/core/user-secret', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<UserSecret> = {
        content: 'foo-bar-baz',
        type: SecretType.RSA_PUBLIC_KEY,
    };

    let publicKeyHex = Buffer.from(details.content).toString('hex');

    it('should create, read, update, delete resource and get collection', async () => {
        const userResponse = await superTest
            .get('/users?filter[name]=admin&page[limit]=1')
            .auth('admin', 'start123');

        expect(userResponse.body.data).toBeDefined();
        expect(userResponse.body.meta).toBeDefined();
        expect(userResponse.body.meta.total).toEqual(1);

        const user = userResponse.body.data[0];

        details.user_id = user.id;

        let response = await superTest
            .post('/user-secrets')
            .auth('admin', 'start123')
            .send(details);

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        let keys : string[] = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i] as keyof UserSecret) {
                case 'content':
                    expect(response.body[keys[i]]).toEqual(publicKeyHex);
                    break;
                default:
                    expect(response.body[keys[i]]).toEqual(details[keys[i]]);
                    break;
            }
        }

        const entityId = response.body.id;

        // ---------------------------------------------------------

        let userSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<UserSecretsSecretStoragePayload>(USER_SECRETS_SECRET_ENGINE_KEY, details.user_id);

        expect(userSecret.data).toBeDefined();
        expect(userSecret.data).toEqual({
            [entityId]: publicKeyHex,
        });

        // ---------------------------------------------------------

        response = await superTest
            .get('/user-secrets')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);

        // ---------------------------------------------------------

        response = await superTest
            .get(`/user-secrets/${entityId}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.content = 'baz-bar-foo';
        publicKeyHex = Buffer.from(details.content).toString('hex');

        response = await superTest
            .post(`/user-secrets/${entityId}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        keys = Object.keys(details);
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i] as keyof UserSecret) {
                case 'content':
                    expect(response.body[keys[i]]).toEqual(publicKeyHex);
                    break;
                default:
                    expect(response.body[keys[i]]).toEqual(details[keys[i]]);
                    break;
            }
        }

        // ---------------------------------------------------------

        userSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<UserSecretsSecretStoragePayload>(USER_SECRETS_SECRET_ENGINE_KEY, details.user_id);

        expect(userSecret.data).toBeDefined();
        expect(userSecret.data).toEqual({
            [entityId]: publicKeyHex,
        });

        // ---------------------------------------------------------

        response = await superTest
            .delete(`/user-secrets/${entityId}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);

        userSecret = await useClient<VaultAPI>(ApiKey.VAULT).keyValue
            .find<UserSecretsSecretStoragePayload>(USER_SECRETS_SECRET_ENGINE_KEY, details.user_id);

        expect(userSecret).toBeUndefined();
    });
});
