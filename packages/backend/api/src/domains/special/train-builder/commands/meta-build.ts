/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
} from '@personalhealthtrain/central-common';
import { TrainBuilderMetaPayload } from '../type';
import { buildTrainBuilderStationsProperty } from './utils';

export async function buildTrainBuilderMetaCommandPayload(train: Train) : Promise<Partial<TrainBuilderMetaPayload>> {
    const message : Partial<TrainBuilderMetaPayload> = {
        id: train.id,
    };

    message.stations = await buildTrainBuilderStationsProperty(train.id);

    return message;
}
