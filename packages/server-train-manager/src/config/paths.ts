/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { Train } from '@personalhealthtrain/core';

let writableDirPath : string | undefined;

export function getWritableDirPath() {
    if (typeof writableDirPath !== 'undefined') {
        return writableDirPath;
    }

    writableDirPath = path.resolve(`${__dirname}../../../writable`);
    return writableDirPath;
}

export function generateTrainMinioBucketName(id: Train['id']) {
    return `trains.${id}`;
}
