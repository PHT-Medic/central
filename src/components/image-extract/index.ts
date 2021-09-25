import {ConsumeHandlers, Message} from "amqp-extension";
import {ResultServiceCommand} from "../../domains/result-service";
import {useLogger} from "../../modules/log";
import {extractImage} from "./extract";
import {writeExtractedEvent} from "./write-extracted";
import {writeExtractingEvent} from "./write-extracting";
import {writeExtractingFailedEvent} from "./write-extracting-failed";

export function createImageExtractComponentHandlers() : ConsumeHandlers {
    return {
        [ResultServiceCommand.EXTRACT]: async (message: Message) => {
            useLogger().debug('extract event received', {component: 'image-extract', trainId: message.data.trainId});

            await Promise.resolve(message)
                .then(writeExtractingEvent)
                .then(extractImage)
                .then(writeExtractedEvent)
                .catch(err => writeExtractingFailedEvent(message, err));
        },
    }
}
