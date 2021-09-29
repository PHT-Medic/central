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
