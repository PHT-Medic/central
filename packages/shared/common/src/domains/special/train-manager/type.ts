/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerComponent } from './constants';
import { Registry, RegistryProject, Train } from '../../core';
import {
    TrainManagerBuilderCommand,
    TrainManagerBuilderPayload,
    TrainManagerExtractorCommand,
    TrainManagerExtractorPayload,
    TrainManagerRouterCommand,
    TrainManagerRouterPayload,
} from './components';

// ----------------------------------------------------------

export type TrainManagerQueuePayloadExtended<T extends Record<string, any>> = T & {
    entity: Train,

    registry: Registry,
    registryId: Registry['id'],

    registryProject?: RegistryProject,
    registryProjectId?: RegistryProject['id']
};

// ----------------------------------------------------------

export type TrainManagerCommand<C extends `${TrainManagerComponent}` | TrainManagerComponent> =
    C extends `${TrainManagerComponent.BUILDER}` | TrainManagerComponent.BUILDER ?
        `${TrainManagerBuilderCommand}` | TrainManagerBuilderCommand :
        C extends `${TrainManagerComponent.EXTRACTOR}` | TrainManagerComponent.EXTRACTOR ?
            `${TrainManagerExtractorCommand}` | TrainManagerExtractorCommand :
            C extends `${TrainManagerComponent.ROUTER}` | TrainManagerComponent.ROUTER ?
                `${TrainManagerRouterCommand}` | TrainManagerRouterCommand :
                never;

export type TrainManagerCommandQueuePayload<
    Component extends `${TrainManagerComponent}` | TrainManagerComponent,
    Command extends TrainManagerCommand<Component>,
> =
        Component extends `${TrainManagerComponent.BUILDER}` | TrainManagerComponent.BUILDER ?
            (
                Command extends `${TrainManagerBuilderCommand}` | TrainManagerBuilderCommand ?
                    TrainManagerBuilderPayload<Command> :
                    never
            ) :
            Component extends `${TrainManagerComponent.EXTRACTOR}` | TrainManagerComponent.EXTRACTOR ?
                (
                    Command extends `${TrainManagerExtractorCommand}` | TrainManagerExtractorCommand ?
                        TrainManagerExtractorPayload<Command> :
                        never
                ) :
                Component extends `${TrainManagerComponent.ROUTER}` | TrainManagerComponent.ROUTER ?
                    (
                        Command extends `${TrainManagerRouterCommand}` | TrainManagerRouterCommand ?
                            TrainManagerRouterPayload<Command> :
                            never
                    ) :
                    never;

// ----------------------------------------------------------

export type TrainManagerErrorEventQueuePayload<T extends Record<string, any> = Record<string, any>> = {
    error?: {
        message?: string,
        code?: string | number,
        step?: string
    };
} & T;
