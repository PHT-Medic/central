/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, UserSecret } from '@personalhealthtrain/ui-common';
import { NotFoundError } from '@typescript-error/http';
import { FindConditions, getRepository } from 'typeorm';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';

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

    return res.respondDeleted({ data: entity });
}
