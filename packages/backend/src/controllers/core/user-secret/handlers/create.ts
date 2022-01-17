/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretType, isHex } from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { Buffer } from 'buffer';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { extendUserSecretEnginePayload, runUserSecretValidation } from './utils';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';

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

    await extendUserSecretEnginePayload(entity.user_id, entity.key, entity.content);

    return res.respond({ data: entity });
}
