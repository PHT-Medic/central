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

import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../../domains/special/registry';
import { DispatcherHarborEventWithAdditionalData } from '../extend';
import { AggregatorRegistryEvent, buildAggregatorRegistryQueueMessage } from '../../../domains/special/aggregator';
import { useSpinner } from '../../../config/spinner';

export async function dispatchRegistryEventToSelf(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : DispatcherHarborEventWithAdditionalData = message.data as RegistryEventQueuePayload;

    if (type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useSpinner()
            .info(`skipping ${type} event distribution for self`);
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;
    if (isLibraryProject) {
        useSpinner()
            .info(`skipping ${type} event distribution for self`);
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
