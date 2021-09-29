/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ConsumeHandlers, Message} from "amqp-extension";
import {getRepository} from "typeorm";
import {MasterImage} from "@personalhealthtrain/ui-common";
import {useLogger} from "../../../modules/log";

export type AggregatorMasterImageEventType = 'masterImagePushed';
export const AggregatorMasterImagePushedEvent : AggregatorMasterImageEventType = 'masterImagePushed';

export function createDispatcherAggregatorMasterImageHandlers() : ConsumeHandlers {
    return {
        [AggregatorMasterImagePushedEvent]: async (message: Message) => {
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
