/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI,
} from '../../../modules';
import { TrainStation } from './entity';

export async function getAPITrainStations(options?: BuildInput<TrainStation>) : Promise<CollectionResourceResponse<TrainStation>> {
    const { data: response } = await useAPI(APIType.DEFAULT).get(`train-stations${buildQuery(options)}`);
    return response;
}

export async function getAPITrainStation(id: typeof TrainStation.prototype.id) : Promise<SingleResourceResponse<TrainStation>> {
    const { data: response } = await useAPI(APIType.DEFAULT).get(`train-stations/${id}`);

    return response;
}

export async function dropAPITrainStation(id: typeof TrainStation.prototype.id) : Promise<SingleResourceResponse<TrainStation>> {
    const { data: response } = await useAPI(APIType.DEFAULT).delete(`train-stations/${id}`);

    return response;
}

export async function editAPITrainStation(id: number, data: Partial<TrainStation>) : Promise<SingleResourceResponse<TrainStation>> {
    const { data: response } = await useAPI(APIType.DEFAULT).post(`train-stations/${id}`, data);

    return response;
}

export async function addAPITrainStation(data: Partial<TrainStation>) : Promise<SingleResourceResponse<TrainStation>> {
    const { data: response } = await useAPI(APIType.DEFAULT).post('train-stations', data);

    return response;
}
