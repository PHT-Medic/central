/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerExtractionMode } from './constants';

export type TrainManagerExtractingFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type TrainManagerExtractingFile = {
    name: string,
    path?: string,
    size: number,
    content: string,
    type: TrainManagerExtractingFileType
};

export type TrainManagerExtractingQueuePayload = {
    filePaths?: string[],
    files?: TrainManagerExtractingFile[],

    mode: `${TrainManagerExtractionMode}`,

    projectName: string,
    repositoryName: string
};
