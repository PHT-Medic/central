/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@personalhealthtrain/core';
import type { RouterRoutePayload } from '../type';

export function isRouterRoutePayload(input: unknown) : input is RouterRoutePayload {
    return isObject(input) &&
        typeof input.repositoryName === 'string' &&
        typeof input.projectName === 'string' &&
        typeof input.operator === 'string' &&
        typeof input.artifactTag === 'string';
}
