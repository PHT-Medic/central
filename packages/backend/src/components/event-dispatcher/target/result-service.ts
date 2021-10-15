/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Message, publishMessage} from "amqp-extension";

import {REGISTRY_OUTGOING_PROJECT_NAME,} from "@personalhealthtrain/ui-common";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {
    buildResultServiceQueueMessage,
    ResultServiceCommand
} from "../../../domains/service/result-service";
import {useLogger} from "../../../modules/log";

export async function dispatchHarborEventToResultService(
    message: Message
) : Promise<Message> {
    const data : DispatcherHarborEventData = message.data as DispatcherHarborEventData;

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;
    // only process terminated trains and the PUSH_ARTIFACT event
    if(!isOutgoingProject || data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.START, {
        trainId: data.repositoryName,
        latest: true
    }));

    useLogger().debug('train event pushed to result service aggregator.', {service: 'api-harbor-hook'})

    return message;
}

