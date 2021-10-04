/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildQuery, BuildInput} from "@trapi/query";
import {
    CollectionResourceResponse,
    useAPI, SingleResourceResponse, APIType
} from "../../../modules";

import {MasterImage} from "./entity";

export async function getAPIMasterImages(data?: BuildInput<MasterImage>) : Promise<CollectionResourceResponse<MasterImage>> {
    const response = await useAPI(APIType.DEFAULT).get('master-images' + buildQuery(data));
    return response.data;
}

export async function dropAPIMasterImage(id: string) : Promise<SingleResourceResponse<MasterImage>>{
    const response = await useAPI(APIType.DEFAULT).delete('master-images/' + id);
    return response.data;
}
