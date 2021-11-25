/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import {
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME, isRegistryStationProjectName,
} from '@personalhealthtrain/ui-common';

import {
    DispatcherProposalEvent,
    DispatcherProposalEventData,
} from '../../../domains/pht/proposal/queue';
import { DispatcherTrainEventData, DispatcherTrainEventType } from '../../../domains/pht/train/queue';
import { DispatcherHarborEventData } from '../../../domains/service/harbor/queue';
import { DispatcherHarborEventWithAdditionalData } from '../data/harbor';
import { MessageQueueEmailServiceRoutingKey } from '../../../config/service/mq';

export async function dispatchProposalEventToEmailNotifier(
    message: Message,
) : Promise<Message> {
    const data : DispatcherProposalEventData = message.data as DispatcherProposalEventData;

    const mapping : Record<DispatcherProposalEvent, string> = {
        assigned: 'proposalAssigned',
        approved: 'proposalApproved',
        rejected: 'proposalRejected',
    };

    if (mapping[data.event]) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
            },
            type: mapping[data.event],
            data: {
                id: data.id,
                stationId: data.stationId,
                operatorRealmId: data.operatorRealmId,
                // operatorId: '',
                // operatorType: 'user' | 'service'
            },
        }));
    }

    return message;
}

export async function dispatchTrainEventToEmailNotifier(
    message: Message,
) : Promise<Message> {
    const data : DispatcherTrainEventData = message.data as DispatcherTrainEventData;

    const mapping : Record<DispatcherTrainEventType, string> = {
        assigned: 'trainAssigned',
        approved: 'trainApproved',
        rejected: 'trainRejected',
    };

    if (mapping[data.event]) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
            },
            type: mapping[data.event],
            data: {
                id: data.id,
                stationId: data.stationId,
                operatorRealmId: data.operatorRealmId,
            },
        }));
    }

    return message;
}

export async function dispatchHarborEventToEmailNotifier(
    message: Message,
) : Promise<Message> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if (data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    const isIncomingProject : boolean = data.namespace === REGISTRY_INCOMING_PROJECT_NAME;
    if (isIncomingProject) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
            },
            type: 'trainBuilt',
            data: {
                id: data.repositoryName,
            },
        }));

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;
    if (isOutgoingProject) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
            },
            type: 'trainFinished',
            data: {
                id: data.repositoryName,
            },
        }));

        return message;
    }

    // station project
    const isStationProject : boolean = isRegistryStationProjectName(data.namespace);
    if (isStationProject) {
        if (
            typeof data.station === 'undefined'
            || typeof data.stationIndex === 'undefined'
        ) {
            return message;
        }

        // If stationIndex is 0, than the target is the first station of the route.
        if (data.stationIndex === 0) {
            await publishMessage(buildMessage({
                options: {
                    routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
                },
                type: 'trainStarted',
                data: {
                    id: data.repositoryName,
                    stationId: data.station?.id,
                },
            }));
        }

        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueEmailServiceRoutingKey.EVENT_OUT,
            },
            type: 'trainReady',
            data: {
                id: data.repositoryName,
                stationId: data.station?.id,
            },
        }));
    }

    return message;
}
