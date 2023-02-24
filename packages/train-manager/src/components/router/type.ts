/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import type { RouterCommand } from './constants';

export type RouterRoutePayload = {
    repositoryName: string,
    projectName: string,
    operator: string,
    artifactTag: string
};

export type RouterStartPayload = {
    id: Train['id']
};

export type RouterStatusPayload = {
    id: Train['id']
};

export type RouterPayload<C extends `${RouterCommand}`> =
    C extends `${RouterCommand.START}` | `${RouterCommand.RESET}` ?
        RouterStartPayload :
        C extends `${RouterCommand.CHECK}` ?
            RouterStatusPayload :
            C extends `${RouterCommand.ROUTE}` ?
                RouterRoutePayload :
                never;

export type RouterExecutionContext = ComponentExecutionContext<RouterCommand.CHECK, RouterStatusPayload> |
ComponentExecutionContext<RouterCommand.ROUTE, RouterRoutePayload> |
ComponentExecutionContext<RouterCommand.START, RouterStartPayload>;
