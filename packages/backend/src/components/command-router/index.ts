/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {consumeQueue} from "amqp-extension";
import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "@personalhealthtrain/ui-common";
import {createServiceSecurityComponentHandlers} from "../service-security";

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({routingKey: MQ_UI_SELF_COMMAND_ROUTING_KEY}, {
            ...createServiceSecurityComponentHandlers()
        });
    }

    return {
        start
    }
}
