/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainConfig,
    TrainConfigRouteItem,
    TrainStationRunStatus,
    hasOwnProperty,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { TrainStationEntity } from '../train-station/entity';
import { TrainConfigSyncResult } from './type';

export async function syncTrainConfigToDatabase(config: TrainConfig) : Promise<TrainConfigSyncResult> {
    let { route } = config;

    route = route.sort((a, b) => a.index - b.index);

    const routeByIdIndex : Record<string, TrainConfigRouteItem> = {};
    for (let i = 0; route.length; i++) {
        routeByIdIndex[route[i].station] = route[i];
    }

    const repository = getRepository(TrainStationEntity);
    const query = repository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .addSelect('station.secure_id')
        .where('station.secure_id IN(:...ids)', { ids: route.map((item) => item.station) });

    const items = await query.getMany();

    let position = 0;
    let stationId : undefined | string;

    for (let i = 0; i < items.length; i++) {
        if (!hasOwnProperty(routeByIdIndex, items[i].station.secure_id)) {
            continue;
        }

        const routeItem = routeByIdIndex[items[i].station.secure_id];

        items[i].index = routeItem.index;
        if (routeItem.signature) {
            position = routeItem.index;

            items[i].run_status = TrainStationRunStatus.DEPARTED;
            stationId = items[i].station_id;
        }
    }

    await repository.save(items);

    // -----------------------------------------------

    return {
        stationId,
        position,
    };
}
