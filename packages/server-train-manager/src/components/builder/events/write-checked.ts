/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { BuilderEvent } from '../constants';
import type { BuilderCheckCommandContext, BuilderCheckPayload } from '../type';
import { buildBuilderAggregatorQueuePayload } from '../utils';

export async function writeCheckedEvent(
    context: BuilderCheckCommandContext,
) : Promise<BuilderCheckPayload> {
    await publish(buildBuilderAggregatorQueuePayload({
        event: BuilderEvent.CHECKED,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
