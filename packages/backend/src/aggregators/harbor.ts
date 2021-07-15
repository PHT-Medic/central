import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {TrainStateFinished, TrainStateStarted} from "../domains/pht/train/states";
import {
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME, HARBOR_SYSTEM_USER_NAME, isHarborStationProjectName
} from "../config/services/harbor";
import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {MasterImage} from "../domains/pht/master-image";
import {useLogger} from "../modules/log";
import {MQ_UI_H_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

export type HarborQueueEventMessageData = {
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string
}

function createHarborAggregatorHandlers() {
    return {
        trainPushed: async (message: QueueMessage) => {
            useLogger().debug('trainPushed event received.', {service: 'aggregator-harbor'});

            const repository = getRepository(Train);

            const data : HarborQueueEventMessageData = message.data as HarborQueueEventMessageData;

            const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
            if(isOutgoingProject) {
                await repository.update({
                    id: data.repositoryName
                }, {
                    status: TrainStateFinished
                });

                return;
            }

            const isStationProject : boolean = isHarborStationProjectName(data.namespace);
            if(isStationProject) {
                if(
                    data.operator === HARBOR_SYSTEM_USER_NAME &&
                    data.artifactTag === 'latest'
                ) {
                    // todo: check if station repository is starting repository?
                    await repository.update({
                        id: data.repositoryName
                    }, {
                        status: TrainStateStarted
                    });

                    return;
                }
            }
        },
        masterImagePushed: async (message: QueueMessage) => {
            useLogger().debug('masterImagePushed event received.', {service: 'aggregator-harbor'});

            const data : HarborQueueEventMessageData = message.data as HarborQueueEventMessageData;

            const isLibraryProject : boolean = data.namespace === HARBOR_MASTER_IMAGE_PROJECT_NAME;

            if(isLibraryProject) {
                const repository = getRepository(MasterImage);

                const masterImage = await repository.findOne({
                    path: data.repositoryFullName
                });

                if(typeof masterImage === 'undefined') {
                    await repository.insert({
                        path: data.repositoryFullName,
                        name: data.repositoryName
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
