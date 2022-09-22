/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { MasterImageGroupEntity } from '../../../../../domains/core/master-image-group/entity';

export async function deleteMasterImageGroupRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.has(PermissionID.MASTER_IMAGE_GROUP_MANAGE)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageGroupEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
