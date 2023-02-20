/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type {
    TrainManagerRouterCommand,
    TrainManagerRouterPayload,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerRouterEvent,
} from '@personalhealthtrain/central-common';
import type { QueueEventErrorContext } from '../type';
import { RouterError } from './error';
import { buildEventQueueMessageForAPI } from '../../config';
import { BaseError } from '../error';

export async function writeFailedEvent(
    data: TrainManagerRouterPayload<any>,
    context: QueueEventErrorContext<TrainManagerRouterCommand>,
) {
    const routingError = context.error instanceof RouterError || context.error instanceof BaseError ?
        context.error :
        new RouterError({ previous: context.error });

    await publish(buildEventQueueMessageForAPI({
        event: TrainManagerRouterEvent.FAILED,
        component: TrainManagerComponent.ROUTER,
        command: context.command,
        data: {
            ...data,
            error: {
                code: routingError.getCode(),
                message: routingError.message,
                step: routingError.getStep(),
            },
        },
    }));

    return data;
}
