/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SuperTest, Test } from 'supertest';
import { MASTER_REALM_ID, User } from '@typescript-auth/domains';

export const TEST_DEFAULT_USER : Partial<User> = {
    name: 'test',
    realm_id: MASTER_REALM_ID,
};

export async function createSuperTestUser(superTest: SuperTest<Test>, entity?: Partial<User>) {
    return superTest
        .post('/users')
        .send({
            ...TEST_DEFAULT_USER,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
