/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Buffer } from 'node:buffer';
import { NotFoundError } from '@ebec/http';
import { PermissionID, SecretType, isHex } from '@personalhealthtrain/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runUserSecretValidation } from '../utils';
import { UserSecretEntity, createUserSecretHash } from '../../../../../domains';

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

    entity.hash = createUserSecretHash(entity.content);

    await repository.save(entity);

    return sendAccepted(res, entity);
}
