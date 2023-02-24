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
import type { BuilderCommand } from '../constants';
import { BuilderEvent } from '../constants';
import type { BuilderBuildPayload } from '../type';

export async function writeBuiltEvent<T extends BuilderBuildPayload>(
    context: ComponentExecutionContext<`${BuilderCommand}`, T>,
) : Promise<T> {
    await publish(buildAPIQueueMessage({
        event: BuilderEvent.BUILT,
        command: context.command,
        component: Component.BUILDER,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
