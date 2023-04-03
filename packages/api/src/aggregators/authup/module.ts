/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@authup/core';
import type { DomainEventContext } from '@authup/core';
import { createClient } from 'redis-extension';
import { useEnv, useLogger } from '../../config';
import type { Aggregator } from '../type';
import {
    handleAuthupRealmEvent,
    handleAuthupRobotEvent,
    handleAuthupUserEvent,
} from './entities';

export function buildAuthupAggregator() : Aggregator {
    return {
        start() {
            const redisSub = createClient({
                connectionString: useEnv('redisConnectionString'),
            });

            redisSub.subscribe('realm', 'user', 'robot');

            redisSub.on('message', async (channel, message) => {
                useLogger().info(`Received event from channel ${channel}`);
                const event = JSON.parse(message) as DomainEventContext;

                switch (event.type) {
                    case DomainType.REALM: {
                        await handleAuthupRealmEvent(event);
                        break;
                    }
                    case DomainType.ROBOT: {
                        await handleAuthupRobotEvent(event);
                        break;
                    }
                    case DomainType.USER: {
                        await handleAuthupUserEvent(event);
                        break;
                    }
                }
            });
        },
    };
}
