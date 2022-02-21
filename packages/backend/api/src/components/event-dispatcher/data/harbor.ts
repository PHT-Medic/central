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
    TrainStationRunStatus,

    buildRegistryStationProjectName,
    isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { DispatcherHarborEventData } from '../../../domains/special/registry/queue';
import { TrainStationEntity } from '../../../domains/core/train-station/entity';

export type DispatcherHarborEventWithAdditionalData = DispatcherHarborEventData & {
    station?: Station,
    stationIndex?: number,
    stations?: Station[]
};

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
        typeof data.station === 'undefined' ||
        typeof data.stations === 'undefined'
    ) {
        const repository = getRepository(TrainStationEntity);
        const query = repository.createQueryBuilder('trainStation')
            .addSelect('station.secure_id')
            .leftJoinAndSelect('trainStation.station', 'station')
            .where('trainStation.train_id = :trainId', { trainId: data.repositoryName })
            .orderBy('trainStation.position', 'ASC');

        const entities = await query.getMany();

        data.stations = entities.map((entity) => entity.station);

        const matchedIndex : number = data.stations.findIndex((entity) => buildRegistryStationProjectName(entity.secure_id) === data.namespace);
        data.station = matchedIndex !== -1 ? data.stations[matchedIndex] : undefined;

        // -----

        const passedEntities = entities.filter((entity) => !!entity.run_status);
        if (passedEntities.length > 0) {
            data.stationIndex = passedEntities.length - 1; // length - 1 + 1}
        }

        message.data = data;
    }

    return message;
}
