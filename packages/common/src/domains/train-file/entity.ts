/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core';
import type { DomainType } from '../constants';
import type { Proposal } from '../proposal';
import type { Train } from '../train';
import type { DomainEventBaseContext } from '../types-base';

export interface TrainFile {
    id: string;

    name: string;

    hash: string;

    directory: string | null;

    size: number | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    user_id: User['id'];

    train_id: Train['id'];

    train: Train;

    realm_id: Realm['id'];
}

export type TrainFileEventContext = DomainEventBaseContext & {
    type: `${DomainType.TRAIN_FILE}`,
    data: TrainFile
};
