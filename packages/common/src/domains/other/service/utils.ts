/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SERVICE_ID, ServiceIDType} from "./type";


const values = Object.values(SERVICE_ID);
export function isService(name: any) : name is ServiceIDType {
    return values.indexOf(name) !== -1;
}
