/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainConfig, TrainContainerFileName, TrainContainerPath, TrainManagerExtractingQueuePayload, isTrainConfig,
} from '@personalhealthtrain/central-common';

export function extractTrainConfigFromTrainExtractorPayload(
    payload: TrainManagerExtractingQueuePayload,
) : undefined | TrainConfig {
    if (!payload.files || payload.files.length === 0) {
        return undefined;
    }

    const index = payload.files.findIndex((file) => {
        if (
            file.path &&
            file.path === TrainContainerPath.CONFIG
        ) {
            return true;
        }

        return file.name === TrainContainerFileName.CONFIG;
    });

    if (index === -1) {
        return undefined;
    }

    if (payload.files[index].size === 0) {
        return undefined;
    }

    const raw = JSON.parse(payload.files[index].content);

    return isTrainConfig(raw) ?
        raw :
        undefined;
}
