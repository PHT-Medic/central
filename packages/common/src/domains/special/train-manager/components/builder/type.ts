/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '../../../../core';
import type { TrainManagerBuilderCommand } from './constants';

export type TrainManagerBuilderBuildPayload = {
    id: Train['id']
};

export type TrainManagerBuilderCheckPayload = {
    id: Train['id']
};

export type TrainManagerBuilderPayload<C extends `${TrainManagerBuilderCommand}`> =
    C extends `${TrainManagerBuilderCommand.BUILD}` ?
        TrainManagerBuilderBuildPayload :
        C extends `${TrainManagerBuilderCommand.CHECK}` ?
            TrainManagerBuilderCheckPayload :
            never;
