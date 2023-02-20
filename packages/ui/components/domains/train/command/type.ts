/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train, TrainCommand } from '@personalhealthtrain/central-common';
import type { ActionCommandProperties } from '../../../render/type';

export type TrainCommandProperties = {
    entity: Train,
    command: `${TrainCommand}` | 'resultDownload',
} & ActionCommandProperties;
