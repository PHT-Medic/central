/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isQueuePayload } from '../queue';
import type { AggregatorQueuePayload } from './type';

export function isAggregatorQueuePayload(input: unknown) : input is AggregatorQueuePayload {
    return isQueuePayload(input) &&
        typeof input.metadata.command === 'string' &&
        typeof input.metadata.component === 'string' &&
        typeof input.metadata.event === 'string';
}
