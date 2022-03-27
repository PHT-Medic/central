/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerRoutingQueueEvent,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { buildAPIQueueEventMessage } from '../../../config/queue';
import { RouteContext } from '../type';
import { useLogger } from '../../../modules/log';

export async function routeOutgoingProject(context: RouteContext) : Promise<void> {
    useLogger().debug(`Handle outgoing project ${context.project.name}.`, {
        component: 'routing',
    });

    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerRoutingQueueEvent.FINISHED,
        context.payload,
    ));
}
