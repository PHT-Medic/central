/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MasterImage, Station, Train,
} from '@personalhealthtrain/ui-common';
import {
    UserEntity,
} from '@typescript-auth/server';

export enum TrainBuilderCommand {
    START = 'trainBuildStart',
    STOP = 'trainBuildStop',
    STATUS = 'trainBuildStatus',
}

export type TrainBuilderStartPayload = {
    userId: typeof UserEntity.prototype.id,

    trainId: Train['id'],
    buildId: Train['build_id'],
    proposalId: Train['proposal_id'],
    sessionId: Train['session_id'],
    hash: Train['hash']
    hashSigned: Train['hash_signed'],
    query: Train['query'],

    masterImage: MasterImage['virtual_path'],

    entrypointCommand?: string,
    entrypointCommandArguments?: string | string[],
    entrypointPath: string,

    files: string[],

    stations: Station['secure_id'][],

    user_he_key: string // todo: this should be camelcase and be removed
};
