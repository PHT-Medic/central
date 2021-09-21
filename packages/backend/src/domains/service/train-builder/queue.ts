import {Train} from "../../pht/train";
import {MQ_TB_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {buildTrainBuilderStartCommandPayload, buildTrainBuilderStopCommandPayload} from "./commands";
import {
    buildQueueMessage,
    QueueMessage
} from "../../../modules/message-queue";

export enum TrainBuilderCommand {
    START = 'trainBuildStart',
    STOP = 'trainBuildStop'
}

export async function buildTrainBuilderQueueMessage(
    type: TrainBuilderCommand,
    train: Train,
    metaData: Record<string, any> = {}
) : Promise<QueueMessage> {
    let data : Record<string, any>;

    switch (type) {
        case TrainBuilderCommand.START:
            data = buildTrainBuilderStartCommandPayload(train);
            break;
        case TrainBuilderCommand.STOP:
            data = buildTrainBuilderStopCommandPayload(train);
            break;
    }
    return buildQueueMessage({
        type,
        routingKey: MQ_TB_ROUTING_KEY,
        data,
        metadata: metaData
    })
}
