/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRobotEventEmitter } from '@typescript-auth/server';
import { publishMessage } from 'amqp-extension';
import { buildRobotQueueMessage } from '../domains/auth/service/queue';
import { RobotQueueCommand } from '../domains/auth/service/constants';

export function buildRobotAggregator() {
    function start() {
        useRobotEventEmitter()
            .on('credentials', async (robot) => {
                const queueMessage = buildRobotQueueMessage(
                    RobotQueueCommand.SECRET_STORAGE_SYNC,
                    {
                        id: robot.name,
                        robotId: robot.id,
                        robotSecret: robot.secret,
                    },
                );

                await publishMessage(queueMessage);
            });
    }

    return {
        start,
    };
}
