/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Train,
} from '@personalhealthtrain/core';
import type { BuilderCommand, BuilderEvent } from './constants';

export type BuilderBuildPayload = {
    id: Train['id']
};

export type BuilderCheckPayload = {
    id: Train['id']
};

export type BuilderBuildCommandContext = {
    command: `${BuilderCommand.BUILD}`,
    data: BuilderBuildPayload,
};

export type BuilderCheckCommandContext = {
    command: `${BuilderCommand.CHECK}`,
    data: BuilderCheckPayload
};

export type BuilderBuildEventContext = Omit<BuilderBuildCommandContext, 'command'> & {
    command: `${BuilderCommand.BUILD}` | `${BuilderCommand.CHECK}`,
    event: `${BuilderEvent.FAILED}` |
        `${BuilderEvent.BUILT}` |
        `${BuilderEvent.BUILDING}` |
        `${BuilderEvent.PUSHED}` |
        `${BuilderEvent.PUSHING}`;
};

export type BuilderCheckEventContext = BuilderCheckCommandContext & {
    event: `${BuilderEvent.FAILED}` |
        `${BuilderEvent.CHECKED}` |
        `${BuilderEvent.CHECKING}` |
        `${BuilderEvent.NONE}`;
};

export type BuilderCommandContext = BuilderCheckCommandContext | BuilderBuildCommandContext;
export type BuilderEventContext = BuilderCheckEventContext | BuilderBuildEventContext;
