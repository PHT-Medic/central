/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type StationRegistryQueuePayload = {
    [key: string]: any
};

export type StationRegistryEntity = {
    id: string,
    name: string,
    realm_id?: string,
    [key: string]: any,
};
