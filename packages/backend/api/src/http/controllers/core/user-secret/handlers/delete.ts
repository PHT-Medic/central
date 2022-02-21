/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, UserSecret } from '@personalhealthtrain/ui-common';
import { NotFoundError } from '@typescript-error/http';
import { FindConditions, getRepository } from 'typeorm';
import { publishMessage } from 'amqp-extension';
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

    const repository = getRepository(UserSecretEntity);

    const conditions : FindConditions<UserSecret> = {
        id,
        realm_id: req.realmId,
    };

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        conditions.user_id = req.userId;
    }

    const entity = await repository.findOne(conditions);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.remove(entity);

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
