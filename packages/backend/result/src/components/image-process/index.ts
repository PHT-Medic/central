import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { extractImage } from './extract';
import { writeExtractedEvent } from './write-processed';
import { writeExtractingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { writeDownloadingEvent } from './write-downloading';
import { downloadImage } from './download';
import { writeDownloadedEvent } from './write-downloaded';
import { ImageProcessError } from './error';

export function createImageProcessComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.EXTRACT]: async (message: Message) => {
            useLogger().debug('process event received', {
                component: 'image-process',
            });

            await Promise.resolve(message)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeExtractingEvent)
                .then(extractImage)
                .then(writeExtractedEvent)
                .catch((err: ImageProcessError) => writeFailedEvent(message, err));
        },
    };
}
