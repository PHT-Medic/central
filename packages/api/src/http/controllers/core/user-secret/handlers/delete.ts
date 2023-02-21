/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { UserSecret } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import type { FindOptionsWhere } from 'typeorm';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';
import { useEnv } from '../../../../../config';
import { saveUserSecretsToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/user';
import {
    SecretStorageCommand,
    SecretStorageEntityType,
} from '../../../../../components/secret-storage/constants';
import { buildSecretStorageQueueMessage } from '../../../../../components/secret-storage/queue';
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
            type: SecretStorageEntityType.USER_SECRETS,
            id: entity.user_id,
        });
    } else {
        await publish(buildSecretStorageQueueMessage(
            SecretStorageCommand.SAVE,
            {
                type: SecretStorageEntityType.USER_SECRETS,
                id: entity.user_id,
            },
        ));
    }

    return sendAccepted(res, entity);
}
