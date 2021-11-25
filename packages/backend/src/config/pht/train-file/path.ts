/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainFile } from '@personalhealthtrain/ui-common';
import path from 'path';
import { getWritableDirPath } from '../../paths';

export function getTrainFileFilePath(file: TrainFile) {
    return `${getTrainFileDirectoryPath(file)}/${getTrainFileFileName(file)}`;
}

export function getTrainFileFileName(file: TrainFile) {
    return `${file.hash}.file`;
}

export function getTrainFileDirectoryPath(file: TrainFile) {
    return path.resolve(`${getWritableDirPath()}/train-files`);
}
