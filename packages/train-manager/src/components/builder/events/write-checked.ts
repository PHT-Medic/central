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
import { BuilderEvent } from '../constants';
import type { BuilderCommand } from '../constants';
import type { BuilderCheckPayload } from '../type';

export async function writeCheckedEvent<T extends BuilderCheckPayload>(
    context: ComponentExecutionContext<`${BuilderCommand}`, T>,
) {
    await publish(buildAPIQueueMessage({
        event: BuilderEvent.CHECKED,
        command: context.command,
        component: Component.BUILDER,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
