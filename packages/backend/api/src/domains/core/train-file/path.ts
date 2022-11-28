/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';

export function generateTrainFilesMinioBucketName(id: Train['id']) {
    return `trains#${id}:files`;
}

export function generateTrainResultsMinioBucketName(id: Train['id']) {
    return `trains#${id}:results`;
}
