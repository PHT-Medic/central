/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MasterImage, Station, Train, User,
} from '@personalhealthtrain/ui-common';

export enum TrainBuilderCommand {
    START = 'trainBuildStart',
    STOP = 'trainBuildStop',
    STATUS = 'trainBuildStatus',
}

export type TrainBuilderStartPayload = {
    userId: typeof User.prototype.id,

    trainId: typeof Train.prototype.id,
    buildId: typeof Train.prototype.build_id,
    proposalId: typeof Train.prototype.proposal_id,
    sessionId: typeof Train.prototype.session_id,
    hash: typeof Train.prototype.hash,
    hashSigned: typeof Train.prototype.hash_signed,
    query: typeof Train.prototype.query,

    masterImage: typeof MasterImage.prototype.virtual_path,

    entrypointCommand?: string,
    entrypointCommandArguments?: string | string[],
    entrypointPath: string,

    files: string[],

    stations: typeof Station.prototype.secure_id[],

    user_he_key: string // todo: this should be camelcase and be removed
};
