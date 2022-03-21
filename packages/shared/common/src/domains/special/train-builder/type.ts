/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { User } from '@authelion/common';
import {
    Ecosystem, MasterImage, Station, Train,
} from '../../core';
import { UserSecret } from '../../auth';

export type TrainBuilderStation = {
    id: Station['secure_id'],
    ecosystem: Ecosystem,
    index: number
};

export type TrainBuilderStartPayload = {
    id: Train['id'],

    user_id: User['id'],
    user_rsa_secret_id: UserSecret['id'],
    user_paillier_secret_id: UserSecret['id'],

    proposal_id: Train['proposal_id'],
    session_id: Train['session_id'],
    hash: Train['hash']
    hash_signed: Train['hash_signed'],
    query: Train['query'],

    master_image: MasterImage['virtual_path'],

    entrypoint_command?: string,
    entrypoint_command_arguments?: string | string[],
    entrypoint_path: string,

    files: string[],

    stations: TrainBuilderStation[]
};
