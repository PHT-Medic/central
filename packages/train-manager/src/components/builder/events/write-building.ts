/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type { BuilderCommand } from '../constants';
import { BuilderEvent } from '../constants';
import type { BuilderBuildCommandContext, BuilderBuildPayload } from '../type';
import { buildBuilderAggregatorQueuePayload } from '../utils';

export async function writeBuildingEvent(
    context: ComponentContextWithCommand<BuilderBuildCommandContext, `${BuilderCommand}`>,
) : Promise<BuilderBuildPayload> {
    await publish(buildBuilderAggregatorQueuePayload({
        event: BuilderEvent.BUILDING,
        command: context.command,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
