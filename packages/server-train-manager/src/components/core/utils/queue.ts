/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { transformComponentErrorForQueuePayload } from '@personalhealthtrain/server-core';
import type { ComponentContextWithError } from '@personalhealthtrain/server-core';
import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName } from '../../constants';
import type { QueueRouterPayload } from '../../utils';
import { ROUTER_QUEUE_ROUTING_KEY, cleanupPayload } from '../../utils';
import type { CoreCommandContext, CoreEventContext } from '../type';
import { useCoreLogger } from './logger';

export function buildCoreQueuePayload(
    context: CoreCommandContext,
) : PublishOptionsExtended<QueueRouterPayload> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                component: ComponentName.CORE,
                command: context.command,
            },
        },
    };
}

export function buildCoreAggregatorQueuePayload(
    context: CoreEventContext | ComponentContextWithError<CoreEventContext>,
) {
    const error = transformComponentErrorForQueuePayload(context);
    if (error) {
        useCoreLogger().error('Command execution failed.', {
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
                component: ComponentName.CORE,
                event: context.event,
            },
            ...(error ? { error } : {}),
        },
    };
}
