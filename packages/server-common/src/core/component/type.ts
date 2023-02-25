/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { QueuePayload, QueuePayloadError } from '../queue';
import type { ComponentError } from './error';

export type Component = {
    start: () => void
};

export type ComponentContextWithError<
    T extends ObjectLiteral = ObjectLiteral,
> = T & {
    error: ComponentError | Error
};

export type ComponentContextWithCommand<
    T extends ObjectLiteral = ObjectLiteral,
    C extends string = string,
> = Omit<T, 'command'> & {
    command: C
};

export type ComponentCommandQueuePayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = QueuePayload<T, {
    command: string,
    component: string
} & M>;

export type ComponentEventQueuePayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = QueuePayload<T, {
    command: string,
    component: string,
    event: string,
    error?: QueuePayloadError
} & M>;
