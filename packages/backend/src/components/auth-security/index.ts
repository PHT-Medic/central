/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { syncRobotSecret } from './handlers/robot-secret-sync';
import { ServiceCommand } from '../../domains/extra/service/constants';

export function createServiceComponentHandlers() : Record<ServiceCommand, ConsumeHandler> {
    return {
        [ServiceCommand.ROBOT_SECRET_SYNC]: async (message: Message) => {
            await syncRobotSecret(message);
        },
    };
}
