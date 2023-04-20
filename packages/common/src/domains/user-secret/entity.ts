/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core';
import type { DomainType } from '../constants';
import type { DomainEventBaseContext } from '../types-base';
import type { SecretType } from './constants';

export interface UserSecret {
    id: string;

    key: string;

    type: SecretType;

    content: string;

    user_id: User['id'];

    realm_id: Realm['id'];

    created_at: Date;

    updated_at: Date;
}

export type UserSecretSecretEventContext = DomainEventBaseContext & {
    type: `${DomainType.USER_SECRET}`,
    data: UserSecret
};
