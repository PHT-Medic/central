/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isQueuePayload } from '../queue';
import type { ComponentQueuePayload } from './type';

export function isComponentQueuePayload(input: unknown) : input is ComponentQueuePayload {
    return isQueuePayload(input) &&
        typeof input.metadata.event === 'string';
}
