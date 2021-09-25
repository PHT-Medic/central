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
