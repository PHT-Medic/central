/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export function getProviderAuthorizeUri(id) {
    const baseUrl : string = useApi('auth').config.baseURL ?? '';

    return baseUrl+'providers/'+id+'/authorize-url';
}

export async function getProviders(record?: RequestRecord) {
    try {
        let response = await useApi('auth').get('providers' + formatRequestRecord(record));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Provider konnten nicht geladen werden.');
    }
}

export async function getProvider(id: number) {
    try {
        let response = await useApi('auth').get('providers/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropProvider(id: number) {
    try {
        let response = await useApi('auth').delete('providers/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function addProvider(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('providers',changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider konnte nicht erstellt werden.');
    }
}

export async function editProvider(userId: number, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('providers/'+userId, changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider konnte nicht editiert werden.');
    }
}
