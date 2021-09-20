import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {getRepository} from "typeorm";
import {TrainResult} from "../domains/pht/train-result";
import {
    TrainResultStatus
} from "../domains/pht/train-result/status";
import {MQ_UI_RS_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

function createTrainBuilderAggregatorHandlers() {
    return {
        downloading: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStatus.DOWNLOADING
            });
        },
        downloaded: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStatus.DOWNLOADED
            });
        },
        downloadingFailed: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            // todo: better status
            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStatus.FAILED
            });
        },
        extracting: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStatus.EXTRACTING
            });
        },
        extracted: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStatus.FINISHED // because TrainResultStateExtracted = finished
            });
        },
        extractingFailed: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            // todo: better status
            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStatus.FAILED
            });
        }
    }
}

export function buildTrainResultAggregator() {
    const handlers = createTrainBuilderAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_RS_EVENT_ROUTING_KEY, ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                console.log(e);
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
