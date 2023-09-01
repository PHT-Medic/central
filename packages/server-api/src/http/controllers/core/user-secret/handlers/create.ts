/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretType, isHex } from '@personalhealthtrain/core';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runUserSecretValidation } from '../utils';
import { UserSecretEntity, createUserSecretHash } from '../../../../../domains';

export async function createUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const data = await runUserSecretValidation(req, 'create');

    if (
        data.type !== SecretType.PAILLIER_PUBLIC_KEY &&
        !isHex(data.content)
    ) {
        data.content = Buffer.from(data.content, 'utf-8').toString('hex');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);

    const realm = useRequestEnv(req, 'realm');
    const entity = repository.create({
        user_id: useRequestEnv(req, 'userId'),
        realm_id: realm.id,
        ...data,
    });

    entity.hash = createUserSecretHash(entity.content);

    await repository.save(entity);

    return sendCreated(res, entity);
}
