/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { TrainQueueCommand, TrainQueuePayload } from '@personalhealthtrain/central-common';
import { cleanupTrain, setupTrain } from './handlers';

export function createTrainComponentHandlers() : Record<TrainQueueCommand, ConsumeHandler> {
    return {
        [TrainQueueCommand.CLEANUP]: async (message: Message) => {
            const payload = message.data as TrainQueuePayload<TrainQueueCommand.CLEANUP>;

            await cleanupTrain(payload);
        },
        [TrainQueueCommand.SETUP]: async (message: Message) => {
            const payload = message.data as TrainQueuePayload<TrainQueueCommand.SETUP>;

            await setupTrain(payload);
        },
    };
}
