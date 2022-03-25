import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@authelion/common';
import { publishMessage } from 'amqp-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runRegistryProjectValidation } from './utils';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function updateRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryProjectValidation(req, 'update');
    if (!result.data) {
        return res.respondAccepted();
    }

    const repository = getRepository(RegistryProjectEntity);
    let entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    if (
        entity.external_name &&
        result.data.external_name &&
        entity.external_name !== result.data.external_name
    ) {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_UNLINK,
            {
                id: entity.id,
                registryId: entity.registry_id,
                externalName: result.data.external_name,
                accountId: result.data.account_id,
            },
        );

        await publishMessage(queueMessage);
    }

    const queueMessage = buildRegistryQueueMessage(
        RegistryQueueCommand.PROJECT_LINK,
        {
            id: entity.id,
        },
    );

    await publishMessage(queueMessage);

    return res.respondAccepted({
        data: entity,
    });
}
