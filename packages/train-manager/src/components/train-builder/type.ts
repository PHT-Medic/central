/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainManagerBuilderBuildPayload,
    TrainManagerBuilderCheckPayload,
    TrainManagerBuilderCommand,
} from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';

type TrainBuilderCheckExecutionContext = ComponentExecutionContext<TrainManagerBuilderCommand.CHECK, TrainManagerBuilderCheckPayload>;
type TrainBuilderBuildExecutionContext = ComponentExecutionContext<TrainManagerBuilderCommand.BUILD, TrainManagerBuilderBuildPayload>;

export type TrainBuilderExecutionContext = TrainBuilderCheckExecutionContext | TrainBuilderBuildExecutionContext;
