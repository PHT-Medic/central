/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { getRepository } from 'typeorm';
import {
    Station,
    TrainStation,
    buildRegistryHarborProjectName,
    isRegistryStationProjectName,
} from '@personalhealthtrain/ui-common';
import { DispatcherHarborEventData } from '../../../domains/service/harbor/queue';

export type DispatcherHarborEventWithAdditionalData = DispatcherHarborEventData & {
    station?: Station,
    stationIndex?: number,
    stations?: Station[]
}

/**
 * Provide related data for the harbor event to f.e the email-notifier & central-ui
 *
 * @param message
 */
export async function extendDispatcherHarborData(message: Message) : Promise<Message> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventWithAdditionalData;

    const isStationProject : boolean = isRegistryStationProjectName(data.namespace);
    if (!isStationProject) {
        return message;
    }

    if (
        typeof data.station === 'undefined'
        || typeof data.stations === 'undefined'
    ) {
        const repository = getRepository(TrainStation);
        const query = repository.createQueryBuilder('trainStation')
            .leftJoinAndSelect('trainStation.station', 'station')
            .where('trainStation.train_id = :trainId', { trainId: data.repositoryName });

        const entities = await query.getMany();
        data.stations = entities.map((entity) => entity.station);

        const index = data.stations.findIndex((entity) => buildRegistryHarborProjectName(entity.secure_id) === data.namespace);

        data.station = index !== -1 ? data.stations[index] : undefined;

        // todo: be aware of sorting :), keep station.position in mind.
        data.stationIndex = index;

        message.data = data;
    }

    return message;
}
