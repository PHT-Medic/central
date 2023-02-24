/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import { Component } from '../../constants';
import { buildAPIQueueMessage } from '../../utils';
import type { RouterCommand } from '../constants';
import { RouterEvent } from '../constants';
import type { RouterStartPayload } from '../type';

export async function writeStartingEvent<T extends RouterStartPayload>(
    context: ComponentExecutionContext<`${RouterCommand}`, T>,
) {
    await publish(buildAPIQueueMessage({
        event: RouterEvent.STARTING,
        component: Component.ROUTER,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
