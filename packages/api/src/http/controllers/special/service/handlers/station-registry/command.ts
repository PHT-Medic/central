/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    StationRegistryCommand,
} from '@personalhealthtrain/central-common';
import {
    BadRequestError, NotImplementedError,
} from '@ebec/http';
import { useRequestBody } from '@routup/body';
import { publishMessage } from 'amqp-extension';
import { Request, Response, sendCreated } from 'routup';
import { useEnv } from '../../../../../../config/env';
import { syncStationRegistry } from '../../../../../../components/station-registry/handlers/sync';
import { StationRegistryQueueCommand } from '../../../../../../domains/special/station-registry/consants';
import { buildStationRegistryQueueMessage } from '../../../../../../domains/special/station-registry/queue';

const commands = Object.values(StationRegistryCommand);

export async function handleStationRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const { command } = useRequestBody(req);

    if (
        !command ||
        commands.indexOf(command) === -1
    ) {
        throw new BadRequestError('The station-registry command is not valid.');
    }

    switch (command as StationRegistryCommand) {
        case StationRegistryCommand.SYNC: {
            if (useEnv('env') === 'test') {
                await syncStationRegistry({
                    id: null,
                    type: StationRegistryQueueCommand.SYNC,
                    data: {},
                    metadata: {},
                });
            } else {
                const queueMessage = buildStationRegistryQueueMessage(
                    StationRegistryQueueCommand.SYNC,
                    {},
                );

                await publishMessage(queueMessage);
            }

            return sendCreated(res);
        }
    }

    throw new NotImplementedError();
}
