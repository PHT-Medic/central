/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SingleResourceResponse, useAPI} from "../../../modules";
import {UserKeyRing} from "./entity";

export async function getAPIUserKeyRing() : Promise<SingleResourceResponse<UserKeyRing>> {
    const response = await useAPI('auth').get('user-key-rings');
    return response.data
}

export async function addAPIUserKeyRing(data: Partial<UserKeyRing>) : Promise<SingleResourceResponse<UserKeyRing>>  {
    const response = await useAPI('auth').post('user-key-rings', data);
    return response.data
}

export async function editAPIUserKeyRing(id: typeof UserKeyRing.prototype.id, data: Partial<UserKeyRing>) : Promise<SingleResourceResponse<UserKeyRing>>  {
    const response = await useAPI('auth').post('user-key-rings/' + id, data);
    return response.data
}

export async function dropAPIUserKeyRing(id: typeof UserKeyRing.prototype.id) : Promise<SingleResourceResponse<UserKeyRing>>  {
    const response = await useAPI('auth').delete('user-key-rings/' + id);
    return response.data
}
