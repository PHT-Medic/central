/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';
import { Message, buildMessage } from 'amqp-extension';
import { buildTrainBuilderStartCommandPayload, buildTrainBuilderStatusCommandPayload, buildTrainBuilderStopCommandPayload } from './commands';
import { TrainBuilderCommand } from './type';
import { MessageQueueRoutingKey } from '../../../config/mq';
import { buildTrainBuilderMetaCommandPayload } from './commands/meta-build';

export async function buildTrainBuilderQueueMessage(
    type: TrainBuilderCommand,
    train: Train,
    metaData: Record<string, any> = {},
) : Promise<Message> {
    let data : Record<string, any>;

    switch (type) {
        case TrainBuilderCommand.START:
            data = await buildTrainBuilderStartCommandPayload(train);
            break;
        case TrainBuilderCommand.STOP:
            data = await buildTrainBuilderStopCommandPayload(train);
            break;
        case TrainBuilderCommand.STATUS:
            data = await buildTrainBuilderStatusCommandPayload(train);
            break;
        case TrainBuilderCommand.META_BUILD:
            data = await buildTrainBuilderMetaCommandPayload(train);
            break;
    }

    return buildMessage({
        type,
        options: {
            routingKey: MessageQueueRoutingKey.TRAIN_BUILDER_COMMAND,
        },
        data,
        metadata: metaData,
    });
}
