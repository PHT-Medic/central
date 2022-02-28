/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import { isRegistryStationProjectName } from '@personalhealthtrain/central-common';
import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../../domains/special/registry';
import { TrainRouterHarborEvent, buildTrainRouterQueueMessage } from '../../../domains/special/train-router';
import { useSpinner } from '../../../config/spinner';

export async function dispatchRegistryEventToTrainRouter(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : RegistryEventQueuePayload = message.data as RegistryEventQueuePayload;

    // station project
    const isStationProject : boolean = isRegistryStationProjectName(data.namespace);

    // only process station trains and the PUSH_ARTIFACT event
    if (!isStationProject || type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useSpinner()
            .info(`skipping ${type} event distribution for train-router`);
        return message;
    }

    await publishMessage(buildTrainRouterQueueMessage(
        TrainRouterHarborEvent.TRAIN_PUSHED,
        {
            repositoryFullName: data.repositoryFullName,
            operator: data.operator,
        },
    ));

    return message;
}
