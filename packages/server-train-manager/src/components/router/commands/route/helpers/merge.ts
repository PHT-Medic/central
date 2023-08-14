/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Station, TrainStation } from '@personalhealthtrain/core';
import { hasOwnProperty } from '@personalhealthtrain/core';
import { BaseError } from '../../../../error';
import type { StationExtended } from '../type';

export function mergeStationsWithTrainStations(
    stations: Station[],
    trainStations: TrainStation[],
    requiredAttributes?: (keyof StationExtended)[],
) : StationExtended[] {
    const aggregatedTrainStations : Record<TrainStation['id'], TrainStation> = {};
    for (let i = 0; i < trainStations.length; i++) {
        aggregatedTrainStations[trainStations[i].station_id] = trainStations[i];
    }

    const items : StationExtended[] = [];

    for (let i = 0; i < stations.length; i++) {
        if (!hasOwnProperty(aggregatedTrainStations, stations[i].id)) {
            continue;
        }

        const item : StationExtended = {
            ...stations[i],
            index: aggregatedTrainStations[stations[i].id].index,
            run_status: aggregatedTrainStations[stations[i].id].run_status,
        };

        if (requiredAttributes) {
            for (let j = 0; j < requiredAttributes.length; j++) {
                if (!hasOwnProperty(item, requiredAttributes[j])) {
                    throw new BaseError(`Attribute ${requiredAttributes[j]} is missing for extended station object.`);
                }
            }
        }

        items.push(item);
    }

    return items;
}
