import {
    consumeMessageQueue,
    handleMessageQueueChannel,
    QueChannelHandler,
    QueueMessage
} from "../../modules/message-queue";
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

function createImageComponentHandlers() : Record<string, QueChannelHandler> {
    return {
        download: async (message: QueueMessage) => {
            useLogger().debug('download event received', {service: 'component-image', trainId: message.data.trainId});

            return Promise.resolve(message)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeExtractCommand)
                .catch(err => writeDownloadingFailedEvent(message, err));
        },
        extract: async (message: QueueMessage) => {
            useLogger().debug('extract event received', {service: 'component-image', trainId: message.data.trainId});

            return Promise.resolve(message)
                .then(writeExtractingEvent)
                .then(extractImage)
                .then(writeExtractedEvent)
                .catch(err => writeExtractingFailedEvent(message, err));
        },
        drop: async (message: QueueMessage) => {

        }
    }
}

export function buildResultComponent() {
    const handlers = createImageComponentHandlers();

    function start() {
        return consumeMessageQueue('rs.command', ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
