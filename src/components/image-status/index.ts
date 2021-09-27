import {ConsumeHandlers, Message} from "amqp-extension";
import {ResultServiceCommand} from "../../domains/service/result-service";
import {useLogger} from "../../modules/log";
import {statusImage} from "./status";
import {writeFailedEvent} from "./write-failed";

export function createImageStatusComponentHandlers() : ConsumeHandlers {
    return {
        [ResultServiceCommand.STATUS]: async (message: Message) => {
            useLogger().debug('status event received', {component: 'image-status', trainId: message.data.trainId});

            console.log(message);
            await Promise.resolve(message)
                .then(statusImage)
                .catch(err => writeFailedEvent(message, err));
        },
    }
}
