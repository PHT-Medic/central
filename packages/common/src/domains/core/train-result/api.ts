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
import { TrainResult } from './entity';

export async function getAPITrainResults(options?: BuildInput<TrainResult>) : Promise<CollectionResourceResponse<TrainResult>> {
    const { data: response } = await useAPI(APIType.DEFAULT).get(`train-results${buildQuery(options)}`);
    return response;
}

export async function getAPITrainResult(
    id: typeof TrainResult.prototype.id,
    options?: BuildInput<TrainResult>,
) : Promise<SingleResourceResponse<TrainResult>> {
    const { data: response } = await useAPI(APIType.DEFAULT).get(`train-results/${id}${buildQuery(options)}`);

    return response;
}

export async function dropAPITrainResult(
    id: typeof TrainResult.prototype.id,
) : Promise<SingleResourceResponse<TrainResult>> {
    const { data: response } = await useAPI(APIType.DEFAULT).delete(`train-results/${id}`);

    return response;
}
