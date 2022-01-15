/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { syncRobotToSecretStorage } from './handlers/secret-storage-sync';
import { RobotQueueCommand } from '../../domains/auth/service/constants';

export function createServiceComponentHandlers() : Record<RobotQueueCommand, ConsumeHandler> {
    return {
        [RobotQueueCommand.SECRET_STORAGE_SYNC]: async (message: Message) => {
            await syncRobotToSecretStorage(message);
        },
    };
}
