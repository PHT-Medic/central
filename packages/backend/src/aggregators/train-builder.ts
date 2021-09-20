import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {TrainBuildStatus} from "../domains/pht/train/status";
import {MQ_UI_TB_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

function createTrainBuilderAggregatorHandlers() {
    return {
        trainBuildFailed: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.trainId
            }, {
                build_status: TrainBuildStatus.FAILED
            });
        },
        trainBuilt: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.trainId
            }, {
                build_status: TrainBuildStatus.FINISHED
            });
        }
    }
}

export function buildTrainBuilderAggregator() {
    const handlers = createTrainBuilderAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_TB_EVENT_ROUTING_KEY, ((async (channel, msg) => {
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
