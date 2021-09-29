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
            data = buildTrainBuilderStartCommandPayload(train);
            break;
        case TrainBuilderCommand.STOP:
            /**
             * {
             *     trainId: 'xyz'
             * }
             */
            data = buildTrainBuilderStopCommandPayload(train);
            break;
        case TrainBuilderCommand.STATUS:
            /**
             * {
             *     trainId: 'xyz'
             * }
             */
            data = buildTrainBuilderStatusCommandPayload(train);
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
