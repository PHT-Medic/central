/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/core';
import type { CoreCommand, CoreEvent } from './constants';

export type CoreConfigurePayload = {
    id: Train['id']
};

export type CoreDestroyPayload = {
    id: Train['id']
};

export type CoreConfigureCommandContext = {
    command: `${CoreCommand.CONFIGURE}`,
    data: CoreConfigurePayload,
};

export type CoreDestroyCommandContext = {
    command: `${CoreCommand.DESTROY}`,
    data: CoreDestroyPayload
};

export type CoreConfigureEventContext = CoreConfigureCommandContext & {
    event: `${CoreEvent.FAILED}` |
        `${CoreEvent.CONFIGURED}` |
        `${CoreEvent.CONFIGURING}`;
};

export type CoreDestroyEventContext = CoreDestroyCommandContext & {
    event: `${CoreEvent.FAILED}` |
        `${CoreEvent.DESTROYED}` |
        `${CoreEvent.DESTROYING}` |
        `${CoreEvent.NONE}`;
};

export type CoreCommandContext = CoreDestroyCommandContext | CoreConfigureCommandContext;
export type CoreEventContext = CoreDestroyEventContext | CoreConfigureEventContext;
