/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainStationRunStatus,
    isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';

import { DispatcherHarborEventData } from '../../../domains/special/registry/queue';
import { DispatcherHarborEventWithAdditionalData } from '../extend';
import { AggregatorRegistryEvent, buildAggregatorRegistryQueueMessage } from '../../../domains/special/aggregator';

export async function dispatchRegistryEventToSelf(
    message: Message,
) : Promise<Message> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if (data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;
    if (isLibraryProject) {
        return message;
    }

    const isIncomingProject : boolean = data.namespace === REGISTRY_INCOMING_PROJECT_NAME;
    if (isIncomingProject) {
        await publishMessage(buildAggregatorRegistryQueueMessage(
            AggregatorRegistryEvent.TRAIN_INITIALIZED,
            {
                id: data.repositoryName,
            },
        ));

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;
    if (isOutgoingProject) {
        await publishMessage(buildAggregatorRegistryQueueMessage(
            AggregatorRegistryEvent.TRAIN_FINISHED,
            {
                id: data.repositoryName,
            },
        ));

        return message;
    }

    // station project
    const isStationProject : boolean = isRegistryStationProjectName(data.namespace);
    if (isStationProject) {
        if (
            typeof data.station === 'undefined' ||
            typeof data.stationIndex === 'undefined'
        ) {
            return message;
        }

        // If stationIndex is 0, then the target is the first station of the route.
        if (data.stationIndex === 0) {
            await publishMessage(buildAggregatorRegistryQueueMessage(
                AggregatorRegistryEvent.TRAIN_STARTED,
                {
                    id: data.repositoryName,
                    stationId: data.station.id,
                },
            ));
        }

        await publishMessage(buildAggregatorRegistryQueueMessage(
            AggregatorRegistryEvent.TRAIN_MOVED,
            {
                id: data.repositoryName,
                stationId: data.station.id,
                stationIndex: data.stationIndex,
                status: data.operator === REGISTRY_SYSTEM_USER_NAME ?
                    TrainStationRunStatus.ARRIVED :
                    TrainStationRunStatus.DEPARTED,
                artifactTag: data.artifactTag,
                artifactDigest: data.artifactDigest,
            },
        ));
    }

    return message;
}
