/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { syncAuthClientSecurity } from './sync';

export enum AuthClientSecurityComponentCommand {
    SYNC = 'syncClientSecurity',
}

export function createAuthSecurityComponentHandlers() : Record<AuthClientSecurityComponentCommand, ConsumeHandler> {
    return {
        [AuthClientSecurityComponentCommand.SYNC]: async (message: Message) => {
            await syncAuthClientSecurity(message);
        },
    };
}
