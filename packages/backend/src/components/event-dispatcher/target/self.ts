/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import {
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainStationRunStatus,
    isRegistryStationProjectName,
} from '@personalhealthtrain/ui-common';
import { AggregatorMasterImagePushedEvent } from '../../../aggregators/dispatcher/handlers/master-image';
import { AggregatorTrainEvent } from '../../../aggregators/dispatcher/handlers/train';

import { DispatcherHarborEventData } from '../../../domains/extra/harbor/queue';
import { DispatcherHarborEventWithAdditionalData } from '../data/harbor';
import { MessageQueueDispatcherRoutingKey } from '../../../config/service/mq';

export async function dispatchHarborEventToSelf(
    message: Message,
) : Promise<Message> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if (data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;
    if (isLibraryProject) {
        await processMasterImage(data);
        return message;
    }

    const isIncomingProject : boolean = data.namespace === REGISTRY_INCOMING_PROJECT_NAME;
    if (isIncomingProject) {
        await processIncomingTrain(data);

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;
    if (isOutgoingProject) {
        await processOutgoingTrain(data);

        return message;
    }

    // station project
    const isStationProject : boolean = isRegistryStationProjectName(data.namespace);
    if (isStationProject) {
        await processStationTrain(data);
    }

    return message;
}

async function processMasterImage(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN,
        },
        type: AggregatorMasterImagePushedEvent,
        data: {
            path: data.repositoryFullName,
            name: data.repositoryName,
        },
    }));
}

async function processIncomingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN,
        },
        type: AggregatorTrainEvent.BUILD_FINISHED,
        data: {
            id: data.repositoryName,
        },
    }));
}

async function processOutgoingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN,
        },
        type: AggregatorTrainEvent.FINISHED,
        data: {
            id: data.repositoryName,
        },
    }));
}

async function processStationTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    if (
        typeof data.station === 'undefined' ||
        typeof data.stationIndex === 'undefined'
    ) {
        return;
    }

    // If stationIndex is 0, than the target is the first station of the route.
    if (data.stationIndex === 0) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN,
            },
            type: AggregatorTrainEvent.STARTED,
            data: {
                id: data.repositoryName,
                stationId: data.station.id,
            },
        }));
    }

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN,
        },
        type: AggregatorTrainEvent.MOVED,
        data: {
            id: data.repositoryName,
            stationId: data.station.id,
            status: data.operator === REGISTRY_SYSTEM_USER_NAME ? TrainStationRunStatus.ARRIVED : TrainStationRunStatus.DEPARTED,
        },
    }));
}
