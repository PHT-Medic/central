/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station } from '@personalhealthtrain/central-common';
import { SuperTest, Test } from 'supertest';
import { MASTER_REALM_ID } from '@authelion/common';

export const TEST_DEFAULT_STATION : Partial<Station> = {
    name: 'foo-bar-baz',
    realm_id: MASTER_REALM_ID,
    public_key: 'fooBarBazFooBarBaz',
    secure_id: 'bar007',
};

export async function createSuperTestStation(superTest: SuperTest<Test>, entity?: Partial<Station>) {
    return superTest
        .post('/stations')
        .send({
            ...TEST_DEFAULT_STATION,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
