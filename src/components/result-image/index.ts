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

function createImageComponentHandlers() : Record<string, QueChannelHandler> {
    return {
        download: async (message: QueueMessage) => {
            return Promise.resolve(message)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeExtractCommand)
                .catch(err => writeDownloadingFailedEvent(message, err));
        },
        extract: async (message: QueueMessage) => {
            return Promise.resolve(message)
                .then(writeExtractingEvent)
                .then(extractImage)
                .then(writeExtractedEvent)
                .catch(err => writeExtractingFailedEvent(message, err));
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
