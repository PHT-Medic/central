import {getRepository} from "typeorm";
import {MasterImage} from "../../../domains/pht/master-image";
import {useLogger} from "../../../modules/log";
import {QueChannelHandler, QueueMessage} from "../../../modules/message-queue";

export type AggregatorMasterImageEventType = 'masterImagePushed';
export const AggregatorMasterImagePushedEvent : AggregatorMasterImageEventType = 'masterImagePushed';

export function createDispatcherAggregatorMasterImageHandlers() : Record<string, QueChannelHandler> {
    return {
        [AggregatorMasterImagePushedEvent]: async (message: QueueMessage) => {
            useLogger().debug('masterImagePushed event received.', {service: 'aggregator-harbor'});

            const repository = getRepository(MasterImage);
            const masterImage = await repository.findOne({
                path: message.data.path
            });

            if(typeof masterImage === 'undefined') {
                await repository.insert({
                    path: message.data.path,
                    name: message.data.name
                });

                useLogger().debug('master image created.', {service: 'aggregator-harbor'})
            } else {
                useLogger().debug('master image already exists.', {service: 'aggregator-harbor'})
            }
        }

    }
}
