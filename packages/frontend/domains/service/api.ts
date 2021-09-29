/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getServices(options?: RequestRecord) {
    const {data} = await useApi('auth').get('services' + formatRequestRecord(options));

    return data;
}

export async function getService(id: string, options?: RequestRecord) {
    const {data} = await useApi('auth').get('services/' + id + formatRequestRecord(options));

    return data;
}

export async function executeServiceTask(id: string, task: string, data: Record<string, any>) {
    const {data: resultData} = await useApi('auth').post('services/'+id + '/task', {task, ...data});

    return resultData;
}

export async function executeServiceClientTask(id: number, task: string, data: Record<string, any>) {
    const {data: resultData} = await useApi('auth').post('services/'+id + '/client/task', {task, ...data});

    return resultData;
}
