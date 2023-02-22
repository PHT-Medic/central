/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { QueuePayload } from '../queue';

export type AggregatorExecutionContext = {
    component: string,
    command: string,
    data: string,
    event: string
};

export type AggregatorQueuePayload = QueuePayload<ObjectLiteral, {
    component: string,
    command: string,
    event: string,
}>;
