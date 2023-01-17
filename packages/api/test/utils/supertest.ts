/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import supertest, { SuperTest, Test } from 'supertest';
import { createRouter } from '../../src/http/router';
import { createConfig } from '../../src';

export function useSuperTest() : SuperTest<Test> {
    createConfig();

    const router = createRouter();
    return supertest(router.createListener());
}
