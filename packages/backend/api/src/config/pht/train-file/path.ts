/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainFile } from '@personalhealthtrain/central-common';
import path from 'path';
import { getWritableDirPath } from '../../paths';

export function getTrainFileFileName(file: TrainFile) {
    return `${file.hash}.file`;
}

export function getTrainFilesDirectoryPath(trainId: Train['id']) {
    return path.join(getWritableDirPath(), 'train-files', trainId);
}

export function getTrainFileFilePath(file: TrainFile) {
    return path.join(getTrainFilesDirectoryPath(file.train_id), getTrainFileFileName(file));
}
