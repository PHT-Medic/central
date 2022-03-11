/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type TrainConfigRouteItem = {
    station: string,
    eco_system: string,
    rsa_public_key: string,
    index: number,
    signature: string | null,
    encrypted_key: string | null
};

export type TrainConfig = {
    route: TrainConfigRouteItem[],
    file_list: string[],
    immutable_file_hash: string,
    immutable_file_signature: string,
    [key: string]: any
};
