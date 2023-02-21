/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import { PermissionID, SecretType, isHex } from '@personalhealthtrain/central-common';
import { Buffer } from 'buffer';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runUserSecretValidation } from '../utils';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';
import { buildSecretStorageQueueMessage } from '../../../../../components/secret-storage/queue';
import {
    SecretStorageCommand,
    SecretStorageEntityType,
} from '../../../../../components/secret-storage/constants';
import { useEnv } from '../../../../../config';
import { saveUserSecretsToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/user';

export async function updateUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const data = await runUserSecretValidation(req, 'update');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);

    const ability = useRequestEnv(req, 'ability');

    const realm = useRequestEnv(req, 'realm');
    let entity = await repository.findOneBy({
        id,
        realm_id: realm.id,
        ...(!ability.has(PermissionID.USER_EDIT) ? { user_id: useRequestEnv(req, 'userId') } : {}),
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        data.type !== SecretType.PAILLIER_PUBLIC_KEY &&
        data.content !== entity.content &&
        !isHex(data.content)
    ) {
        data.content = Buffer.from(data.content, 'utf-8').toString('hex');
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

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
