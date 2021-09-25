import {ConsumeHandlers, Message} from "amqp-extension";
import {ResultServiceCommand} from "../../domains/service/result-service";

import {writeDownloadingFailedEvent} from "./write-downloading-failed";
import {writeDownloadedEvent} from "./write-downloaded";
import {downloadImage} from "./download";
import {writeDownloadingEvent} from "./write-downloading";
import {writeExtractCommand} from "./write-extract-command";
import {useLogger} from "../../modules/log";

export function createImageDownloadComponentHandlers() : ConsumeHandlers {
    return {
        [ResultServiceCommand.DOWNLOAD]: async (message: Message) => {
            useLogger().debug('download event received', {component: 'image-download', trainId: message.data.trainId});

            await Promise.resolve(message)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeExtractCommand)
                .catch(err => writeDownloadingFailedEvent(message, err));
        }
    }
}
