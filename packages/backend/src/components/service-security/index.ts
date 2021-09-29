/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ConsumeHandler, Message} from "amqp-extension";
import {syncServiceSecurity} from "./sync";

export enum ServiceSecurityComponent {
    SYNC = 'syncServiceSecurity'
}

export function createServiceSecurityComponentHandlers() : Record<ServiceSecurityComponent, ConsumeHandler> {
    return {
        [ServiceSecurityComponent.SYNC]: async(message: Message) => {
            await syncServiceSecurity(message);
        }
    }
}
