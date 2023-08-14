/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { UserSecret } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import type { FindOptionsWhere } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { UserSecretEntity } from '../../../../../domains';
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

    return sendAccepted(res, entity);
}
