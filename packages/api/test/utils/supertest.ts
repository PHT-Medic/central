/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import supertest, { SuperTest, Test } from 'supertest';
import { createRouter } from '../../src/http/router';
import { createConfig } from '../../src/config';
import env from '../../src/env';

export function useSuperTest() : SuperTest<Test> {
    createConfig({ env });

    const router = createRouter();
    return supertest(router.createListener());
}