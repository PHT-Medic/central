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
    getRegistryStationProjectNameId, isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';

import { getRepository } from 'typeorm';
import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../../domains/special/registry';
import { AggregatorRegistryEvent, buildAggregatorRegistryQueueMessage } from '../../../domains/special/aggregator';
import { useLogger } from '../../../config/log';
import { StationEntity } from '../../../domains/core/station/entity';

export async function dispatchRegistryEventToSelf(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : RegistryEventQueuePayload = message.data as RegistryEventQueuePayload;

    if (type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useLogger()
            .info(`skipping ${type} event distribution for self`);
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;
    if (isLibraryProject) {
        useLogger()
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
        const stationRepository = getRepository(StationEntity);
        const station = await stationRepository.findOne({
            secure_id: getRegistryStationProjectNameId(data.namespace),
        });

        if (typeof station === 'undefined') {
            return message;
        }

        await publishMessage(buildAggregatorRegistryQueueMessage(
            AggregatorRegistryEvent.TRAIN_MOVED,
            {
                id: data.repositoryName,
                status: data.operator === REGISTRY_SYSTEM_USER_NAME ?
                    TrainStationRunStatus.ARRIVED :
                    TrainStationRunStatus.DEPARTED,
                artifactTag: data.artifactTag,
                artifactDigest: data.artifactDigest,
                stationId: station.id,
            },
        ));
    }

    return message;
}
