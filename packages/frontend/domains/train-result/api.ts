/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";

export async function runTrainResultTask(id: string, task: string, data: Record<string,any> = {}) {
    const actionData = {
        task,
        ...data
    };

    const {data: response} = await useApi('auth').post('train-results/' + id + '/task', actionData);

    return response;
}
