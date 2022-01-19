/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import {
    HarborAPI, PermissionID,
} from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { buildRegistryStationProjectName } from '@personalhealthtrain/ui-common/dist/domains/core/station/registry';
import { useTrapiClient } from '@trapi/client';
import { publishMessage } from 'amqp-extension';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ApiKey } from '../../../../config/api';
import { buildSecretStorageQueueMessage } from '../../../../domains/extra/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../domains/extra/secret-storage/constants';

export async function deleteStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(StationEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.remove(entity);

    const name = buildRegistryStationProjectName(entity.secure_id);
    await useTrapiClient<HarborAPI>(ApiKey.HARBOR).project.delete(name, true);

    const queueMessage = buildSecretStorageQueueMessage(
        SecretStorageQueueCommand.DELETE,
        {
            type: SecretStorageQueueEntityType.STATION,
            id: entity.id,
        },
    );
    await publishMessage(queueMessage);

    return res.respondDeleted({ data: entity });
}
