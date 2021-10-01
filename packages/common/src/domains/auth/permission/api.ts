/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/query";
import {APIType, useAPI} from "../../../modules";
import {Permission} from "./entity";

export async function getPermissions(data?: RequestRecord<Permission>) {
    const response = await useAPI(APIType.DEFAULT).get('permissions'+formatRequestRecord(data));
    return response.data;
}
