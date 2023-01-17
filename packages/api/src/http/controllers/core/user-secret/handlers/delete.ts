/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, UserSecret } from '@personalhealthtrain/central-common';
import { NotFoundError } from '@ebec/http';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { FindOptionsWhere } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';
import { useEnv } from '../../../../../config/env';
import { saveUserSecretsToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/user';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/special/secret-storage/constants';
import { buildSecretStorageQueueMessage } from '../../../../../domains/special/secret-storage/queue';
import { useRequestEnv } from '../../../../request';

export async function deleteUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);

    const realm = useRequestEnv(req, 'realm');
    const conditions : FindOptionsWhere<UserSecret> = {
        id,
        realm_id: realm.id,
    };

    const ability = useRequestEnv(req, 'ability');

    if (!ability.has(PermissionID.USER_EDIT)) {
        conditions.user_id = useRequestEnv(req, 'userId');
    }

    const entity = await repository.findOneBy(conditions);

    if (!entity) {
        throw new NotFoundError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    if (useEnv('env') === 'test') {
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

    return sendAccepted(res, entity);
}
