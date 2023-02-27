/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';

export function generateTrainMinioBucketName(id: Train['id']) {
    return `trains.${id}`;
}
