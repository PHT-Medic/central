import { ConsumeHandlers, Message } from 'amqp-extension';
import { ResultServiceCommand } from '../../domains/service/result-service';
import { useLogger } from '../../modules/log';
import { writeDownloadCommand } from './write-download-command';
import { writeStartFailedEvent } from './write-start-failed';
import { writeStartedEvent } from './write-started';

export function createImageEntryPointComponentHandlers() : ConsumeHandlers {
    return {
        [ResultServiceCommand.START]: async (message: Message) => {
            useLogger().debug('start event received', { component: 'image-entrypoint', trainId: message.data.trainId });

            await Promise.resolve(message)
                .then(writeStartedEvent)
                .then(writeDownloadCommand)
                .catch((err) => writeStartFailedEvent(message, err));
        },
    };
}
