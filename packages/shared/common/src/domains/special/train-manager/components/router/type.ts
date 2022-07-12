/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '../../../../core';
import { TrainManagerRouterCommand } from './constants';

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
    C extends `${TrainManagerRouterCommand.START}` | TrainManagerRouterCommand.START ?
        TrainManagerRouterStartPayload :
        C extends `${TrainManagerRouterCommand.CHECK}` | TrainManagerRouterCommand.CHECK ?
            TrainManagerRouterStatusPayload :
            C extends `${TrainManagerRouterCommand.ROUTE}` | TrainManagerRouterCommand.ROUTE ?
                TrainManagerRouterRoutePayload :
                never;
