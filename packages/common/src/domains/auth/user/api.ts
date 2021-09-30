/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/data-fetching";
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../../modules";
import {User} from "./entity";

export async function getAPIUsers(options?: RequestRecord<User>) : Promise<CollectionResourceResponse<User>> {
    const response = await useAPI(APIType.DEFAULT).get('users' + formatRequestRecord(options));

    return response.data;
}

export async function getAPIUser(id: typeof User.prototype.id, options?: RequestRecord<User>) : Promise<SingleResourceResponse<User>> {
    const response = await useAPI(APIType.DEFAULT).get('users/' + id + formatRequestRecord(options));

    return response.data;
}

export async function dropAPIUser(id: typeof User.prototype.id) : Promise<SingleResourceResponse<User>> {
    const response = await useAPI(APIType.DEFAULT).delete('users/' + id);

    return response.data;
}

export async function addAPIUser(data: Partial<User>) : Promise<SingleResourceResponse<User>> {
    const response = await useAPI(APIType.DEFAULT).post('users', data);

    return response.data;
}

export async function editAPIUser(userId: typeof User.prototype.id, data: Partial<User> & {password_repeat: typeof User.prototype.password}) : Promise<SingleResourceResponse<User>> {
    const response = await useAPI(APIType.DEFAULT).post('users/' + userId, data);

    return response.data;
}
