/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainConfigSourceType } from './constants';
import type { Proposal } from '../proposal';

export type TrainConfigBuild = {
    signature: string,
    rsa_public_key: string
};

export type TrainConfigRouteItem = {
    station: string,
    eco_system: string,
    rsa_public_key: string,
    index: number,
    signature: Record<string, any> | null,
    encrypted_key: string | null
};

export type TrainConfigSource = {
    type: `${TrainConfigSourceType}`,
    address: string,
    tag?: string | null,
    branch?: string | null
};

export type TrainConfigCreator = {
    id: string,
    rsa_public_key: string,
    paillier_public_key?: string | null,
    encrypted_key?: string | null
};

export type TrainConfig = {
    id: string,

    '@id': string,
    '@context': string | null,

    build: TrainConfigBuild,
    creator: TrainConfigCreator,
    file_list: string[],
    hash: string,
    signature: string,
    proposal_id: Proposal['id'],
    result_hash?: string | null,
    result_signature?: string | null,
    route: TrainConfigRouteItem[],
    session_id: string,
    source: TrainConfigSource,
};
