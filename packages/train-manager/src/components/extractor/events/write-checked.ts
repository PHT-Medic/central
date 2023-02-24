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
import { ExtractorEvent } from '../constants';
import type { ExtractorCommand } from '../constants';
import type { ExtractorCheckPayload } from '../type';

export async function writeCheckedEvent<T extends ExtractorCheckPayload>(
    context: ComponentExecutionContext<`${ExtractorCommand}`, T >,
) {
    await publish(buildAPIQueueMessage({
        event: ExtractorEvent.CHECKING,
        component: Component.EXTRACTOR,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
