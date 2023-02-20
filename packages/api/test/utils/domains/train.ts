/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';
import { TrainType } from '@personalhealthtrain/central-common';
import type { SuperTest, Test } from 'supertest';
import { randomBytes } from 'crypto';

export const TEST_DEFAULT_TRAIN : Partial<Train> = {
    name: 'development',
    type: TrainType.DISCOVERY,
    hash_signed: randomBytes(40).toString('hex'),
    query: '{"key": "value"}',
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
