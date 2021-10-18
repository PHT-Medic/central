/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {AuthClientCommand, AuthClientType, Client} from "@personalhealthtrain/ui-common";
import {buildAuthClientSecurityQueueMessage} from "../../../../domains/service/queue";
import {AuthClientSecurityComponentCommand} from "../../../../components/auth-security";
import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";

const commands = Object.values(AuthClientCommand);

export async function doAuthClientCommand(req: any, res: any) {
    const {id} = req.params;

    if (
        !req.body.command ||
        commands.indexOf(req.body.command) === -1
    ) {
        return res._failBadRequest({message: 'The client command is not valid.'});
    }

    const command: AuthClientCommand = req.body.command;

    const repository = getRepository(Client);
    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(typeof entity.service_id === 'string') {
        if(!req.ability.can('manage','service')) {
            return res._failForbidden({message: 'You are not allowed to manage service clients.'});
        }
    }

    switch (command) {
        case AuthClientCommand.SECRET_REFRESH:
            entity.refreshSecret();
            break;
        case AuthClientCommand.SECRET_SYNC:
            const queueMessage = buildAuthClientSecurityQueueMessage(
                AuthClientSecurityComponentCommand.SYNC,
                {
                    id: entity.service_id,
                    type: AuthClientType.SERVICE,
                    clientId: entity.id,
                    clientSecret: entity.secret
                }
            );

            await publishMessage(queueMessage);
            break;
    }

    await repository.save(entity);

    return res._respondAccepted({data: entity});
}
