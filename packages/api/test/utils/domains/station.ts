/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Station } from '@personalhealthtrain/central-common';
import { Ecosystem } from '@personalhealthtrain/central-common';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_STATION : Partial<Station> = {
    name: 'foo-bar-baz',
    public_key: 'fooBarBazFooBarBaz',
    ecosystem: Ecosystem.DEFAULT,
    external_name: 'test',
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
