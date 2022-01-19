/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretType, isHex } from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { Buffer } from 'buffer';
import { publishMessage } from 'amqp-extension';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { runUserSecretValidation } from './utils';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';
import { buildSecretStorageQueueMessage } from '../../../../domains/extra/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../domains/extra/secret-storage/constants';

export async function createUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const data = await runUserSecretValidation(req, 'create');

    if (
        data.type !== SecretType.PAILLIER_PUBLIC_KEY &&
        !isHex(data.content)
    ) {
        data.content = Buffer.from(data.content, 'utf-8').toString('hex');
    }

    const repository = getRepository(UserSecretEntity);

    const entity = repository.create({
        user_id: req.user.id,
        realm_id: req.realmId,
        ...data,
    });

    await repository.save(entity);

    const queueMessage = buildSecretStorageQueueMessage(
        SecretStorageQueueCommand.SAVE,
        {
            type: SecretStorageQueueEntityType.USER_SECRETS,
            id: entity.user_id,
        },
    );

    await publishMessage(queueMessage);

    return res.respond({ data: entity });
}
