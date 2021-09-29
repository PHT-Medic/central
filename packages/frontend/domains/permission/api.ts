/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getPermissions(data?: RequestRecord) {
    const response = await useApi('auth').get('permissions'+formatRequestRecord(data));
    return response.data;
}
