/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand, ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type { BuilderCommand } from '../constants';
import { BuilderEvent } from '../constants';
import type { BuilderCommandContext } from '../type';
import { buildBuilderAggregatorQueuePayload } from '../utils';

export async function writeFailedEvent(
    context: ComponentContextWithCommand<
    ComponentContextWithError<BuilderCommandContext>,
        `${BuilderCommand}`
    >,
) {
    await publish(buildBuilderAggregatorQueuePayload({
        event: BuilderEvent.FAILED,
        command: context.command,
        data: context.data,
        error: context.error,
    }));
}
