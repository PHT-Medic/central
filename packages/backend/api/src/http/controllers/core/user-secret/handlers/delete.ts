/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, UserSecret } from '@personalhealthtrain/central-common';
import { NotFoundError } from '@typescript-error/http';
import { FindOptionsWhere } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';
import env from '../../../../../env';
import { saveUserSecretsToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/user';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/special/secret-storage/constants';
import { buildSecretStorageQueueMessage } from '../../../../../domains/special/secret-storage/queue';

export async function deleteUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);

    const conditions : FindOptionsWhere<UserSecret> = {
        id,
        realm_id: req.realmId,
    };

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        conditions.user_id = req.userId;
    }

    const entity = await repository.findOneBy(conditions);

    if (!entity) {
        throw new NotFoundError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    if (env.env === 'test') {
        await saveUserSecretsToSecretStorage({
            type: SecretStorageQueueEntityType.USER_SECRETS,
            id: entity.user_id,
        });
    } else {
        const queueMessage = buildSecretStorageQueueMessage(
            SecretStorageQueueCommand.SAVE,
            {
                type: SecretStorageQueueEntityType.USER_SECRETS,
                id: entity.user_id,
            },
        );

        await publishMessage(queueMessage);
    }

    return res.respondDeleted({ data: entity });
}
