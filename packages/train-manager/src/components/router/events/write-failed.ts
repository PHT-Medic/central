/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionErrorContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import { Component } from '../../constants';
import { buildAPIQueueMessage } from '../../utils';
import { RouterEvent } from '../constants';
import type { RouterCommand } from '../constants';
import { RouterError } from '../error';
import { BaseError } from '../../error';
import type { RouterPayload } from '../type';
import { useRouterLogger } from '../utils';

export async function writeFailedEvent(
    context: ComponentExecutionErrorContext<`${RouterCommand}`, RouterPayload<any>>,
) {
    const error = context.error instanceof RouterError || context.error instanceof BaseError ?
        context.error :
        new RouterError({ previous: context.error });

    useRouterLogger().debug('Component execution failed.', {
        command: context.command,
        code: error.getCode(),
        step: error.getStep(),
        message: error.message, // todo: trim message
    });

    await publish(buildAPIQueueMessage({
        event: RouterEvent.FAILED,
        component: Component.ROUTER,
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
