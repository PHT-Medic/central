import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { statusImage } from './status';
import { writeFailedEvent } from './write-failed';

export function createImageStatusComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.STATUS]: async (message: Message) => {
            useLogger().debug('status event received', { component: 'image-status', trainId: message.data.trainId });

            await Promise.resolve(message)
                .then(statusImage)
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.log(err);
                    return writeFailedEvent(message, err);
                });
        },
    };
}
