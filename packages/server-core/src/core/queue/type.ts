/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';

export type QueuePayloadError = {
    code: string,
    message: string,
    step?: string | number,
};

export type QueuePayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    metadata: M,
    error?: QueuePayloadError
};

export type QueueCommandPayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = QueuePayload<T, {command: string, component: string} & M>;

export type QueueEventPayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = QueuePayload<T, {command: string, component: string, event: string} & M>;
