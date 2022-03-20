/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station, TrainStation } from '@personalhealthtrain/central-common';

export type StationExtended = Station & Pick<TrainStation, 'index' | 'run_status'>;
