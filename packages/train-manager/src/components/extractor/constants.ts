/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ExtractorEvent {
    DOWNLOADING = 'downloading', // rs trigger
    DOWNLOADED = 'downloaded', // rs trigger

    EXTRACTING = 'processing', // rs trigger
    EXTRACTED = 'processed', // rs trigger

    CHECKING = 'checking',
    CHECKED = 'checked',

    FAILED = 'failed', // rs trigger,
    NONE = 'none', // rs trigger
}

export enum ExtractorCommand {
    EXTRACT = 'extract',
    CHECK = 'check',
}
