/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'path';
import {
    TrainContainerFileName,
    TrainContainerPath,
    TrainManagerExtractingQueuePayload,
} from '@personalhealthtrain/central-common';
import { extractTrainConfigFromTrainExtractorPayload } from '../../../../src/domains/special/train-manager/utils';

describe('src/domains/train-builder', () => {
    it('should build train message', async () => {
        const trainConfig = await import(path.join(__dirname, '..', '..', 'data', 'train-config.json'));

        const queuePayload : TrainManagerExtractingQueuePayload = {
            filePaths: [TrainContainerPath.CONFIG],
            files: [
                {
                    name: TrainContainerFileName.CONFIG,
                    path: TrainContainerPath.CONFIG,
                    size: 5074,
                    content: JSON.stringify(trainConfig),
                },
            ],
            mode: 'read',
            projectName: 'pht_incoming',
            repositoryName: 'e81a773a-161c-43a2-8eee-2e2723bd1c41',
        };

        const output = extractTrainConfigFromTrainExtractorPayload(queuePayload);

        expect(output).toBeDefined();
        expect(output.route).toBeDefined();
        expect(output.route.length).toEqual(2);
    });
});
