/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/core';
import type { RouterCommand, RouterEvent } from './constants';

export type RouterRoutePayload = {
    repositoryName: string,
    projectName: string,
    operator: string,
    artifactTag: string
};

export type RouterResetPayload = {
    id: Train['id']
};

export type RouterStartPayload = {
    id: Train['id']
};

export type RouterCheckPayload = {
    id: Train['id']
};

export type RouterCheckCommandContext = {
    command: `${RouterCommand.CHECK}`,
    data: RouterCheckPayload
};

export type RouterRouteCommandContext = {
    command: `${RouterCommand.ROUTE}`,
    data: RouterRoutePayload
};

export type RouterResetCommandContext = {
    command: `${RouterCommand.RESET}`,
    data: RouterResetPayload
};

export type RouterStartCommandContext = {
    command: `${RouterCommand.START}`,
    data: RouterStartPayload
};

export type RouterCheckEventContext = RouterCheckCommandContext & {
    event: `${RouterEvent.FAILED}` |
        `${RouterEvent.CHECKED}` |
        `${RouterEvent.CHECKING}`;
};

export type RouterRouteEventContext = Omit<RouterRouteCommandContext, 'command'> & {
    command: `${RouterCommand.ROUTE}` | `${RouterCommand.CHECK}`,
    event: `${RouterEvent.FAILED}` |
        `${RouterEvent.POSITION_FOUND}` |
        `${RouterEvent.POSITION_NOT_FOUND}` |
        `${RouterEvent.ROUTED}` |
        `${RouterEvent.ROUTING}`
};

export type RouterResetEventContext = Omit<RouterResetCommandContext, 'command'> & {
    command: `${RouterCommand.RESET}` | `${RouterCommand.CHECK}`,
    event: `${RouterEvent.FAILED}`;
};

export type RouterStartEventContext = Omit<RouterStartCommandContext, 'command'> & {
    command: `${RouterCommand.START}` | `${RouterCommand.CHECK}`,
    event: `${RouterEvent.FAILED}` |
        `${RouterEvent.STARTED}` |
        `${RouterEvent.STARTING}`;
};

export type RouterCommandContext = RouterCheckCommandContext |
RouterRouteCommandContext |
RouterResetCommandContext |
RouterStartCommandContext;

export type RouterEventContext = RouterCheckEventContext |
RouterRouteEventContext |
RouterResetEventContext |
RouterStartEventContext;
