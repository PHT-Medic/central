/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MasterImage, Station, Train, UserSecret,
} from '@personalhealthtrain/ui-common';
import { User } from '@typescript-auth/domains';

export enum TrainBuilderCommand {
    START = 'trainBuildStart',
    STOP = 'trainBuildStop',
    STATUS = 'trainBuildStatus',
}

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

    stations: Station['secure_id'][]
};
