/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainCommand } from '@personalhealthtrain/central-common';

export type TrainCommandProperties = {
    entity: Train,
    command: `${TrainCommand}` | 'resultDownload',
    elementType: 'button' | 'link' | 'dropDownItem',
    withIcon: boolean,
    withText: boolean
};

export type TrainCommandMethods = {
    do() : Promise<void>
};
