/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Service} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import {buildServiceSecurityQueueMessage} from "../../../domains/service/queue";
import {ServiceSecurityComponent} from "../../../components/service-security";
import {publishMessage} from "amqp-extension";

export enum ServiceClientCommand {
    SYNC = 'sync',
    REFRESH_SECRET = 'refreshSecret'
}

const commands = Object.values(ServiceClientCommand);

export async function handleServiceClientCommand(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    const {command} = req.body;

    if(
        !command ||
        commands.indexOf(command) === -1
    ) {
        return res._failBadRequest({message: 'The client command is not valid.'});
    }

    try {
        const repository = getRepository(Service);
        const entity = await repository.findOne(id, {relations: ['client', 'realm']});

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        switch (command) {
            case ServiceClientCommand.SYNC:
                await syncServiceClient(entity);

                entity.client_synced = true;

                await repository.save(entity);
                break;
            case ServiceClientCommand.REFRESH_SECRET:
                entity.client.refreshSecret();
                entity.client_synced = false;

                await repository.save(entity);
                break;
        }

        return res._respond({data: entity});

    } catch (e) {
        return res._failBadRequest({message: 'The operation was not successful.'});
    }
}

async function syncServiceClient(entity: Service) {
    const queueMessage = buildServiceSecurityQueueMessage(
        ServiceSecurityComponent.SYNC,
        entity.id,
        {
            id: entity.client.id,
            secret: entity.client.secret
        }
    );

    await publishMessage(queueMessage);
}
