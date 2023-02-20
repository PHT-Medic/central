/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type { TrainManagerRouterCommand, TrainManagerRouterPayload } from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerRouterEvent,
} from '@personalhealthtrain/central-common';
import { buildEventQueueMessageForAPI } from '../../../../config';
import type { QueueEventContext } from '../../../type';

export async function writePositionNotFoundEvent(
    data: TrainManagerRouterPayload<any>,
    context: QueueEventContext<TrainManagerRouterCommand>,
) {
    await publish(buildEventQueueMessageForAPI({
        event: TrainManagerRouterEvent.POSITION_NOT_FOUND,
        component: TrainManagerComponent.ROUTER,
        command: context.command,
        data,
    }));

    return data;
}
