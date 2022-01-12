/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { User } from '@typescript-auth/domains';
import { SecretType } from './constants';

export interface UserSecret {
    id: number;

    key: string;

    type: SecretType;

    content: string;

    user_id: string;

    user: User;

    created_at: Date;

    updated_at: Date;
}
