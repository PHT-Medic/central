/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station, TrainStation, hasOwnProperty } from '@personalhealthtrain/central-common';
import { BaseError } from '../../../../error';
import { StationExtended } from '../type';

export function mergeStationsWithTrainStations(
    stations: Station[],
    trainStations: TrainStation[],
    requiredAttributes?: (keyof StationExtended)[],
) : StationExtended[] {
    const aggregatedTrainStations : Record<TrainStation['id'], TrainStation> = {};
    for (let i = 0; i < trainStations.length; i++) {
        aggregatedTrainStations[trainStations[i].station_id] = trainStations[i];
    }

    const extended : StationExtended[] = [];

    for (let i = 0; i < stations.length; i++) {
        if (!hasOwnProperty(aggregatedTrainStations, stations[i].id)) {
            continue;
        }

        const merged : StationExtended = {
            ...stations[i],
            index: aggregatedTrainStations[stations[i].id].index,
            run_status: aggregatedTrainStations[stations[i].id].run_status,
        };

        if (requiredAttributes) {
            for (let i = 0; i < requiredAttributes.length; i++) {
                if (!hasOwnProperty(merged, requiredAttributes[i])) {
                    throw new BaseError(`Attribute ${requiredAttributes[i]} is missing for extended station object.`);
                }
            }
        }

        extended.push();
    }

    return extended;
}
