/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNodeDispatcher } from 'routup';
import type { SuperTest, Test } from 'supertest';
import supertest from 'supertest';
import { createConfig } from '../../src';
import { createRouter } from '../../src/http/router';

export function useSuperTest() : SuperTest<Test> {
    createConfig();

    const router = createRouter();
    return supertest(createNodeDispatcher(router));
}
