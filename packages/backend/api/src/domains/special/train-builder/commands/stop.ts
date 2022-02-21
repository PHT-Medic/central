/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/ui-common';

export async function buildTrainBuilderStopCommandPayload(train: Train) {
    return {
        id: train.id,
    };
}
