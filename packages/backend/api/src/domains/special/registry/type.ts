/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station } from '@personalhealthtrain/central-common';
import { RegistryQueueEntityType } from './constants';

export type RegistryStationQueuePayload = {
    type: RegistryQueueEntityType.STATION
} & Partial<Station>;

export type RegistryQueuePayload =
    RegistryStationQueuePayload;

// ---------------------------------------------------
