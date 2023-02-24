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
import { BuilderEvent } from '../constants';
import type { BuilderCommand } from '../constants';
import { BuilderError } from '../error';
import { BaseError } from '../../error';
import type { BuilderPayload } from '../type';

export async function writeFailedEvent(
    context: ComponentExecutionErrorContext<`${BuilderCommand}`, BuilderPayload<any>>,
) {
    const error = context.error instanceof BuilderError ||
        context.error instanceof BaseError ?
        context.error :
        new BuilderError({ previous: context.error });

    await publish(buildAPIQueueMessage({
        event: BuilderEvent.FAILED,
        component: Component.BUILDER,
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
}
