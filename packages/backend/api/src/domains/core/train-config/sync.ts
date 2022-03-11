/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainConfigRouteItem, hasOwnProperty } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { TrainStationEntity } from '../train-station/entity';

export async function syncTrainConfigRouteToDatabase(route: TrainConfigRouteItem[]) {
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

    for (let i = 0; i < items.length; i++) {
        if (!hasOwnProperty(routeByIdIndex, items[i].station.secure_id)) {
            continue;
        }

        items[i].position = routeByIdIndex[items[i].station.secure_id].index;
    }

    await repository.save(items);
}
