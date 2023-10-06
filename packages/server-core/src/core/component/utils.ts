/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, isObject } from '@personalhealthtrain/core';
import type { ObjectLiteral } from '../../type';
import { isQueuePayload } from '../queue';
import type { QueuePayloadError } from '../queue';
import { ComponentError } from './error';
import type {
    ComponentCommandQueuePayload,
    ComponentContextWithError,
    ComponentEventQueuePayload,
} from './type';

export function isComponentContextWithError(input: unknown) : input is ComponentContextWithError {
    return isObject(input) &&
        hasOwnProperty(input, 'error');
}

export function transformComponentErrorForQueuePayload<T extends ObjectLiteral = ObjectLiteral>(
    context: T | ComponentContextWithError<T>,
) : QueuePayloadError | undefined {
    if (isComponentContextWithError(context)) {
        if (context.error instanceof ComponentError) {
            return {
                code: `${context.error.code}`,
                step: context.error.step,
                message: context.error.message,
            };
        }
        return {
            code: 'none',
            message: context.error.message,
        };
    }

    return undefined;
}

export function isComponentCommandQueuePayload(
    input: unknown,
) : input is ComponentCommandQueuePayload {
    return isQueuePayload(input) &&
        typeof input.metadata.command === 'string' &&
        typeof input.metadata.component === 'string';
}

export function isComponentEventQueuePayload(
    input: unknown,
) : input is ComponentEventQueuePayload {
    return isComponentCommandQueuePayload(input) &&
        typeof input.metadata.event === 'string';

    // todo: check for error shape
}
