/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {RequestRecord, formatRequestRecord} from "@trapi/query";
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../../modules";
import {Realm} from "./entity";

export async function getRealms(data?: RequestRecord<Realm>) : Promise<CollectionResourceResponse<Realm>> {
    let response = await useAPI(APIType.DEFAULT).get('realms' + formatRequestRecord(data));

    return response.data;
}

export async function getRealm(id: typeof Realm.prototype.id) : Promise<SingleResourceResponse<Realm>>  {
    let response = await useAPI(APIType.DEFAULT).get('realms/' + id);

    return response.data;
}

export async function dropRealm(id: typeof Realm.prototype.id) : Promise<SingleResourceResponse<Realm>> {
    let response = await useAPI(APIType.DEFAULT).delete('realms/' + id);

    return response.data;
}

export async function addRealm(data: Partial<Realm>) : Promise<SingleResourceResponse<Realm>> {
    let response = await useAPI(APIType.DEFAULT).post('realms', data);

    return response.data;
}

export async function editRealm(realmId: typeof Realm.prototype.id, data: Partial<Realm>) : Promise<SingleResourceResponse<Realm>> {
    let response = await useAPI(APIType.DEFAULT).post('realms/' + realmId, data);

    return response.data;
}
