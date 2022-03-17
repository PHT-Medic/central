/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainExtractorMode } from './constants';

export type TrainExtractorFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type TrainExtractorFile = {
    name: string,
    path?: string,
    size: number,
    content: string,
    [key: string]: any
};

export type TrainExtractorQueuePayload = {
    filePaths?: string[],
    files?: TrainExtractorFile[],

    mode: `${TrainExtractorMode}`,

    projectName: string,
    repositoryName: string
};
