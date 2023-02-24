/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Train,
} from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import type { BuilderCommand } from './constants';

export type BuilderBuildPayload = {
    id: Train['id']
};

export type BuilderCheckPayload = {
    id: Train['id']
};

export type BuilderPayload<C extends `${BuilderCommand}`> =
    C extends `${BuilderCommand.BUILD}` ?
        BuilderBuildPayload :
        C extends `${BuilderCommand.CHECK}` ?
            BuilderCheckPayload :
            never;

type TrainBuilderCheckExecutionContext = ComponentExecutionContext<BuilderCommand.CHECK, BuilderCheckPayload>;
type TrainBuilderBuildExecutionContext = ComponentExecutionContext<BuilderCommand.BUILD, BuilderBuildPayload>;

export type TrainBuilderExecutionContext = TrainBuilderCheckExecutionContext | TrainBuilderBuildExecutionContext;
