/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionErrorContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type {
    TrainManagerRouterCommand,
    TrainManagerRouterPayload,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerRouterEvent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../utils';
import { RouterError } from '../error';
import { BaseError } from '../../error';

export async function writeFailedEvent(
    context: ComponentExecutionErrorContext<`${TrainManagerRouterCommand}`, TrainManagerRouterPayload<any>>,
) {
    const error = context.error instanceof RouterError || context.error instanceof BaseError ?
        context.error :
        new RouterError({ previous: context.error });

    await publish(buildAPIQueueMessage({
        event: TrainManagerRouterEvent.FAILED,
        component: TrainManagerComponent.ROUTER,
        command: context.command,
        data: {
            ...context.data,
            error: {
                code: error.getCode(),
                message: error.message,
                step: error.getStep(),
            },
        },
    }));

    return context.data;
}
