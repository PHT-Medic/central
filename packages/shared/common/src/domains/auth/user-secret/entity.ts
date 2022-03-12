/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@authelion/common';
import { SecretType } from './constants';

export interface UserSecret {
    id: string;

    key: string;

    type: SecretType;

    content: string;

    user_id: User['id'];

    user: User;

    realm_id: Realm['id'];

    realm: Realm;

    created_at: Date;

    updated_at: Date;
}
