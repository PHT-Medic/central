/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { QueuePayload } from '../queue';

export type ComponentExecutionContext<
    C extends string = string,
    T extends ObjectLiteral = ObjectLiteral,
> = {
    command: `${C}`,
    data: T
};

export type ComponentQueuePayload = QueuePayload<ObjectLiteral, {
    component: string,
    command: string
}>;
