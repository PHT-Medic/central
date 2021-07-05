import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {getRepository} from "typeorm";
import {TrainResult} from "../domains/train/result";
import {
    TrainResultStateDownloaded,
    TrainResultStateDownloading, TrainResultStateExtracted, TrainResultStateExtracting,
    TrainResultStateFailed, TrainResultStateFinished
} from "../domains/train/result/states";
import {MQ_UI_RS_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

function createTrainBuilderAggregatorHandlers() {
    return {
        downloading: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateDownloading
            });
        },
        downloaded: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStateDownloaded
            });
        },
        downloadingFailed: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            // todo: better status
            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStateFailed
            });
        },
        extracting: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateExtracting
            });
        },
        extracted: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateFinished // because TrainResultStateExtracted = finished
            });
        },
        extractingFailed: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            // todo: better status
            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateFailed
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
