/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthClientType,
} from '@personalhealthtrain/ui-common';
import { useSuperTest } from '../../utils/supertest';
import { dropTestDatabase, useTestDatabase } from '../../utils/database/connection';

describe('src/app/auth/client', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const details : Partial<{type: AuthClientType, id: string | number}> = {
        type: AuthClientType.USER,
        id: 1,
    };

    it('should create resource', async () => {
        const response = await superTest
            .post('/clients')
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.type).toEqual(details.type);
        expect(response.body.user_id).toEqual(details.id);
    });
});
