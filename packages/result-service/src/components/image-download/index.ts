import {consumeQueue, Message} from "amqp-extension";
import {MessageQueueSelfRoutingKey} from "../../config/services/rabbitmq";
import {ResultServiceCommand} from "../../domains/result-service";

import {writeDownloadingFailedEvent} from "./write-downloading-failed";
import {writeDownloadedEvent} from "./write-downloaded";
import {downloadImage} from "./download";
import {writeDownloadingEvent} from "./write-downloading";
import {writeExtractCommand} from "./write-extract-command";
import {writeExtractingEvent} from "./write-extracting";
import {extractImage} from "./extract";
import {writeExtractedEvent} from "./write-extracted";
import {writeExtractingFailedEvent} from "./write-extracting-failed";
import {useLogger} from "../../modules/log";

export function buildResultComponent() {
    function start() {
        return consumeQueue({routingKey: MessageQueueSelfRoutingKey.COMMAND}, {
            [ResultServiceCommand.DOWNLOAD]: async (message: Message) => {
                useLogger().debug('download event received', {service: 'component-image', trainId: message.data.trainId});

                await Promise.resolve(message)
                    .then(writeDownloadingEvent)
                    .then(downloadImage)
                    .then(writeDownloadedEvent)
                    .then(writeExtractCommand)
                    .catch(err => writeDownloadingFailedEvent(message, err));
            },
            [ResultServiceCommand.EXTRACT]: async (message: Message) => {
                useLogger().debug('extract event received', {service: 'component-image', trainId: message.data.trainId});

                await Promise.resolve(message)
                    .then(writeExtractingEvent)
                    .then(extractImage)
                    .then(writeExtractedEvent)
                    .catch(err => writeExtractingFailedEvent(message, err));
            },
            [ResultServiceCommand.RESET]: async (message: Message) => {

            }
        });
    }

    return {
        start
    }
}
