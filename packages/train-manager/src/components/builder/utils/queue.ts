/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    transformComponentErrorForQueuePayload,
} from '@personalhealthtrain/central-server-common';
import type { ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName } from '../../constants';
import type { QueueRouterPayload } from '../../utils';
import { ROUTER_QUEUE_ROUTING_KEY, cleanupPayload } from '../../utils';
import type { BuilderCommandContext, BuilderEventContext } from '../type';
import { useBuilderLogger } from './logger';

export function buildBuilderQueuePayload(
    context: BuilderCommandContext,
) : PublishOptionsExtended<QueueRouterPayload> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                component: ComponentName.BUILDER,
                command: context.command,
            },
        },
    };
}

export function buildBuilderAggregatorQueuePayload(
    context: BuilderEventContext | ComponentContextWithError<BuilderEventContext>,
) {
    const error = transformComponentErrorForQueuePayload(context);
    if (error) {
        useBuilderLogger().error('Command execution failed.', {
            command: context.command,
            ...error,
        });
    }

    return {
        exchange: {
            routingKey: 'api.aggregator.tm',
        },
        content: {
            data: cleanupPayload({ ...context.data }),
            metadata: {
                command: context.command,
                component: ComponentName.BUILDER,
                event: context.event,
            },
            ...(error ? { error } : {}),
        },
    };
}
