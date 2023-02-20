/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '../../../../core';
import type { TrainManagerRouterCommand } from './constants';

export type TrainManagerRouterRoutePayload = {
    repositoryName: string,
    projectName: string,
    operator: string,
    artifactTag: string
};

export type TrainManagerRouterStartPayload = {
    id: Train['id']
};

export type TrainManagerRouterStatusPayload = {
    id: Train['id']
};

export type TrainManagerRouterPayload<C extends `${TrainManagerRouterCommand}`> =
    C extends `${TrainManagerRouterCommand.START}` | `${TrainManagerRouterCommand.RESET}` ?
        TrainManagerRouterStartPayload :
        C extends `${TrainManagerRouterCommand.CHECK}` ?
            TrainManagerRouterStatusPayload :
            C extends `${TrainManagerRouterCommand.ROUTE}` ?
                TrainManagerRouterRoutePayload :
                never;
