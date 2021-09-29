/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Realm, ResourceCollectionResponse} from "@personalhealthtrain/ui-common";
import {useApi} from "~/modules/api";
import {changeRequestKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getRealms(data?: RequestRecord) : Promise<ResourceCollectionResponse<Realm>> {
    let response = await useApi('auth').get('realms' + formatRequestRecord(data));

    return response.data;
}

export async function getRealm(id: string) {
    let response = await useApi('auth').get('realms/'+id);

    return response.data;
}

export async function dropRealm(id: string) {
    let response = await useApi('auth').delete('realms/'+id);

    return response.data;
}

export async function addRealm(data: {[key: string] : any}) {
    let response = await useApi('auth').post('realms',changeRequestKeyCase(data));

    return response.data;
}

export async function editRealm(realmId: string, data: {[key: string] : any}) {
    let response = await useApi('auth').post('realms/'+realmId, changeRequestKeyCase(data));

    return response.data;
}
