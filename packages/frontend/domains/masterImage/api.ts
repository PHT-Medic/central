/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getMasterImages(data?: RequestRecord) {
    const response = await useApi('auth').get('master-images' + formatRequestRecord(data));
    return response.data;
}

export async function dropMasterImage(id: number | string) {
    const {data} = await useApi('auth').delete('master-images/' + id);
    return data;
}
