/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MASTER_REALM_ID, OAuth2Provider } from '@personalhealthtrain/ui-common';
import { Oauth2Client } from '@typescript-auth/core';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';
import env from '../../../src/env';

describe('src/app/auth/provider', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<OAuth2Provider> = {
        name: 'keycloak',
        authorize_path: '/protocol/openid-connect/auth',
        client_id: 'pht',
        client_secret: 'start123',
        open_id: true,
        token_host: 'https://keycloak-pht.tada5hi.net/auth/realms/master/',
        token_path: '/protocol/openid-connect/token',
        realm_id: MASTER_REALM_ID,
    };

    it('should read collection', async () => {
        const response = await superTest
            .get('/providers')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(0);
    });

    it('should create, read, update, delete resource', async () => {
        let response = await superTest
            .post('/providers')
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
            .get(`/providers/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        // ---------------------------------------------------------

        details.name = 'TestA';

        response = await superTest
            .post(`/providers/${response.body.id}`)
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
            .delete(`/providers/${response.body.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
    });

    it('should build authorize url', async () => {
        let response = await superTest
            .post('/providers')
            .send(details)
            .auth('admin', 'start123');

        const provider = response.body;

        response = await superTest
            .get(`/providers/${response.body.id}/authorize-url`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(302);
        expect(response.header.location).toBeDefined();

        const oauth2Client = new Oauth2Client({
            client_id: provider.client_id,
            token_host: provider.token_host,
            authorize_host: provider.authorize_host,
            authorize_path: provider.authorize_path,
            redirect_uri: `${env.apiUrl}/providers/${provider.id}/authorize-callback`,
        });

        expect(response.header.location).toEqual(oauth2Client.buildAuthorizeURL());
    });
});
