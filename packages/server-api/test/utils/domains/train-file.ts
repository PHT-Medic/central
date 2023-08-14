/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainFile } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_TRAIN_FILE : Partial<TrainFile> = {
    directory: '.',
    hash: '158b78c9ea3314386d98bd0b24518e144dad8ba7fcf3617b50c99500fd639448',
    name: 'tood.txt',
    size: 478,
};

export async function createSuperTestTrainFile(superTest: SuperTest<Test>, file: any) {
    return superTest
        .post('/master-images')
        .attach('file[0]', file)
        .auth('admin', 'start123');
}
