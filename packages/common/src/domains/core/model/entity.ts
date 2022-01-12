/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { User } from '@typescript-auth/domains';
import { TrainFile } from '../train-file';

export interface Model {
    id: string;

    type: string;

    name: string;

    src: TrainFile;

    // ------------------------------------------------------------------

    user_id: string;

    user: User;
}
