import {QueChannelHandler, QueueMessage} from "../../modules/message-queue";
import {syncServiceSecurity} from "./sync";

export enum ServiceSecurityComponent {
    SYNC = 'syncServiceSecurity'
}

export function createServiceSecurityComponentHandlers() : Record<ServiceSecurityComponent, QueChannelHandler> {
    return {
        [ServiceSecurityComponent.SYNC]: async(message: QueueMessage) => {
            await syncServiceSecurity(message);
        }
    }
}
