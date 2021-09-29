/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildMessage, Message} from "amqp-extension";
import {MQ_RS_COMMAND_ROUTING_KEY} from "@personalhealthtrain/ui-common";

export enum ResultServiceCommand {
    START = 'start',
    STOP = 'stop',
    STATUS = 'status'
}

export type ResultServiceDataPayload = {
    id?: string,
    trainId: string
}

export function buildResultServiceQueueMessage(
    command: ResultServiceCommand,
    data: ResultServiceDataPayload
) : Message {
   return buildMessage({
        options: {
            routingKey: MQ_RS_COMMAND_ROUTING_KEY
        },
        type: command,
        data
    });
}
