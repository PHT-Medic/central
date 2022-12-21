/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerBuilderEvent,
} from '@personalhealthtrain/central-common';
import { buildEventQueueMessageForAPI } from '../../../../config/queue';

export async function writePushingEvent(message: Message) {
    await publishMessage(buildEventQueueMessageForAPI(
        TrainManagerBuilderEvent.PUSHING,
        message.data,
        message.metadata,
    ));

    return message;
}
