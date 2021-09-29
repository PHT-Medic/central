/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildMessage, Message, publishMessage} from "amqp-extension";
import {AggregatorMasterImagePushedEvent} from "../../../aggregators/dispatcher/handlers/master-image";
import {AggregatorTrainEvent} from "../../../aggregators/dispatcher/handlers/train";

import {
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME,
    HARBOR_SYSTEM_USER_NAME,
    MQ_UI_D_EVENT_ROUTING_KEY,
    isHarborStationProjectName,
    TrainStationRunStatus
} from "@personalhealthtrain/ui-common";

import {} from "@personalhealthtrain/ui-common";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {DispatcherHarborEventWithAdditionalData} from "../data/harbor";

export async function dispatchHarborEventToSelf(
    message: Message
) : Promise<Message> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if(data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === HARBOR_MASTER_IMAGE_PROJECT_NAME;
    if(isLibraryProject) {
        await processMasterImage(data);
        return message;
    }

    const isIncomingProject : boolean = data.namespace === HARBOR_INCOMING_PROJECT_NAME;
    if(isIncomingProject) {
        await processIncomingTrain(data);

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
    if(isOutgoingProject) {
        await processOutgoingTrain(data);

        return message;
    }

    // station project
    const isStationProject : boolean = isHarborStationProjectName(data.namespace);
    if(isStationProject) {
        await processStationTrain(data);
    }

    return message;
}

async function processMasterImage(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MQ_UI_D_EVENT_ROUTING_KEY
        },
        type: AggregatorMasterImagePushedEvent,
        data: {
            path: data.repositoryFullName,
            name: data.repositoryName
        }
    }));
}

async function processIncomingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MQ_UI_D_EVENT_ROUTING_KEY
        },
        type: AggregatorTrainEvent.BUILD_FINISHED,
        data: {
            id: data.repositoryName
        }
    }));
}

async function processOutgoingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishMessage(buildMessage({
        options: {
            routingKey: MQ_UI_D_EVENT_ROUTING_KEY
        },
        type: AggregatorTrainEvent.FINISHED,
        data: {
            id: data.repositoryName
        }
    }));
}

async function processStationTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    if(
        typeof data.station === 'undefined' ||
        typeof data.stationIndex === 'undefined'
    ) {
        return;
    }

    // If stationIndex is 0, than the target is the first station of the route.
    if(data.stationIndex === 0) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MQ_UI_D_EVENT_ROUTING_KEY
            },
            type: AggregatorTrainEvent.STARTED,
            data: {
                id: data.repositoryName,
                stationId: data.station.id
            }
        }));
    }

    await publishMessage(buildMessage({
        options: {
            routingKey: MQ_UI_D_EVENT_ROUTING_KEY
        },
        type: AggregatorTrainEvent.MOVED,
        data: {
            id: data.repositoryName,
            stationId: data.station.id,
            status: data.operator === HARBOR_SYSTEM_USER_NAME ? TrainStationRunStatus.ARRIVED : TrainStationRunStatus.DEPARTED
        }
    }));
}
