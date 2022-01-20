import { NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { PermissionID, SecretType, isHex } from '@personalhealthtrain/ui-common';
import { Buffer } from 'buffer';
import { publishMessage } from 'amqp-extension';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { runUserSecretValidation } from './utils';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';
import { buildSecretStorageQueueMessage } from '../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../domains/special/secret-storage/constants';
import env from '../../../../env';
import { saveUserSecretsToSecretStorage } from '../../../../components/secret-storage/handlers/entities/user';

export async function updateUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const data = await runUserSecretValidation(req, 'update');

    const repository = getRepository(UserSecretEntity);

    let entity = await repository.findOne({
        id,
        realm_id: req.realmId,
        ...(!req.ability.hasPermission(PermissionID.USER_EDIT) ? { user_id: req.user.id } : {}),
    });

    if (typeof entity === 'undefined') {
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

    return res.respond({ data: entity });
}
