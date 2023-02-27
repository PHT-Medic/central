/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    StationRegistryAPICommand,
} from '@personalhealthtrain/central-common';
import {
    BadRequestError, NotImplementedError,
} from '@ebec/http';
import { useRequestBody } from '@routup/body';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useEnv } from '../../../../../../config';
import {
    StationRegistryCommand,
    buildStationRegistryQueueMessage,
    syncStationRegistry,
} from '../../../../../../components';

const commands = Object.values(StationRegistryAPICommand);

export async function handleStationRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const { command } = useRequestBody(req);

    if (
        !command ||
        commands.indexOf(command) === -1
    ) {
        throw new BadRequestError('The station-registry command is not valid.');
    }

    switch (command as StationRegistryAPICommand) {
        case StationRegistryAPICommand.SYNC: {
            if (useEnv('env') === 'test') {
                await syncStationRegistry();
            } else {
                const queueMessage = buildStationRegistryQueueMessage({
                    command: StationRegistryCommand.SYNC,
                    data: {},
                });

                await publish(queueMessage);
            }

            return sendCreated(res);
        }
    }

    throw new NotImplementedError();
}
