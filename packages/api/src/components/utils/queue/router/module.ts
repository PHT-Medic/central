/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConsumeMessage } from 'amqp-extension';
import { consume } from 'amqp-extension';
import { useLogger } from '../../../../config';
import { ComponentName } from '../../../constants';
import { executeSecretStorageComponentCommand } from '../../../secret-storage';
import { executeRegistryCommand } from '../../../registry';
import { executeStationRegistryCommand } from '../../../station-registry';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';
import type { QueueRouterPayload } from './type';

export function buildRouterComponent() {
    function start() {
        return consume({ exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY } }, {
            $any: async (message: ConsumeMessage) => {
                const payload : QueueRouterPayload<any> = JSON.parse(message.content.toString('utf-8'));

                useLogger().debug('Command received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                });

                switch (payload.metadata.component) {
                    case ComponentName.REGISTRY: {
                        await executeRegistryCommand({
                            command: payload.metadata.command as any,
                            data: payload.data as any,
                        });
                        break;
                    }
                    case ComponentName.SECRET_STORAGE: {
                        await executeSecretStorageComponentCommand({
                            command: payload.metadata.command as any,
                            data: payload.data as any,
                        });
                        break;
                    }
                    case ComponentName.STATION_REGISTRY: {
                        await executeStationRegistryCommand({
                            command: payload.metadata.command as any,
                            data: payload.data as any,
                        });
                        break;
                    }
                }
            },
        });
    }

    return {
        start,
    };
}
