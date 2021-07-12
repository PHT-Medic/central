import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {TrainStateFinished} from "../domains/pht/train/states";
import {
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME
} from "../config/services/harbor";
import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {MasterImage} from "../domains/pht/master-image";
import {useLogger} from "../modules/log";
import {MQ_UI_H_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

function createHarborAggregatorHandlers() {
    return {
        trainPushed: async (message: QueueMessage) => {
            useLogger().debug('trainPushed event received.', {service: 'aggregator-harbor'})
            const isOutgoingProject : boolean = message.data.projectName === HARBOR_OUTGOING_PROJECT_NAME;

            const repository = getRepository(Train);
            if(isOutgoingProject) {
                await repository.update({
                    id: message.data.repositoryName
                }, {
                    status: TrainStateFinished
                });
            }
        },
        masterImagePushed: async (message: QueueMessage) => {
            useLogger().debug('masterImagePushed event received.', {service: 'aggregator-harbor'})
            const isLibraryProject : boolean = message.data.projectName === HARBOR_MASTER_IMAGE_PROJECT_NAME;

            if(isLibraryProject) {
                const repository = getRepository(MasterImage);

                const masterImage = await repository.findOne({
                    path: message.data.repositoryFullName
                });

                if(typeof masterImage === 'undefined') {
                    await repository.insert({
                        path: message.data.repositoryFullName,
                        name: message.data.repositoryName
                    });

                    useLogger().debug('master image created.', {service: 'aggregator-harbor'})
                } else {
                    useLogger().debug('master image already exists.', {service: 'aggregator-harbor'})
                }
            }

        }
    }
}

export function buildHarborAggregator() {
    const handlers = createHarborAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_H_EVENT_ROUTING_KEY, ((async (channel, msg) => {
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
