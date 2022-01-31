/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainType } from '@personalhealthtrain/ui-common';
import { SuperTest, Test } from 'supertest';
import { MASTER_REALM_ID } from '@typescript-auth/domains';

export const TEST_DEFAULT_TRAIN : Partial<Train> = {
    name: 'development',
    realm_id: MASTER_REALM_ID,
    type: TrainType.DISCOVERY,
};

export async function createSuperTestTrain(superTest: SuperTest<Test>, entity?: Partial<Train>) {
    return superTest
        .post('/trains')
        .send({
            ...TEST_DEFAULT_TRAIN,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
