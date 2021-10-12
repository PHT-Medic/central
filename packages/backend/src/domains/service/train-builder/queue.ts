/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {MQ_TB_ROUTING_KEY, Train} from "@personalhealthtrain/ui-common";
import {buildMessage, Message} from "amqp-extension";
import {buildTrainBuilderStartCommandPayload, buildTrainBuilderStatusCommandPayload, buildTrainBuilderStopCommandPayload} from "./commands";
import {TrainBuilderCommand} from "./type";

export async function buildTrainBuilderQueueMessage(
    type: TrainBuilderCommand,
    train: Train,
    metaData: Record<string, any> = {}
) : Promise<Message> {
    let data : Record<string, any>;

    switch (type) {
        case TrainBuilderCommand.START:
            /**
             * {
             *     trainId: 'xyz',
             *     ...
             * }
             */
            data = await buildTrainBuilderStartCommandPayload(train);
            break;
        case TrainBuilderCommand.STOP:
            /**
             * {
             *     trainId: 'xyz'
             * }
             */
            data = await buildTrainBuilderStopCommandPayload(train);
            break;
        case TrainBuilderCommand.STATUS:
            /**
             * {
             *     trainId: 'xyz'
             * }
             */
            data = await buildTrainBuilderStatusCommandPayload(train);
            break;
    }

    return buildMessage({
        type,
        options: {
            routingKey: MQ_TB_ROUTING_KEY
        },
        data,
        metadata: metaData
    })
}
