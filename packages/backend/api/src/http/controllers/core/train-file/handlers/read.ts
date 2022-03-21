import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@authelion/common';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import { applyFilters } from 'typeorm-extension';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const { fileId } = req.params;

    const repository = getRepository(TrainFileEntity);

    const entity = await repository.findOne({
        id: fileId,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainFileGetManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { filter } = req.query;

    const repository = getRepository(TrainFileEntity);
    const query = repository.createQueryBuilder('trainFile')
        .where('trainFile.train_id = :trainId', { trainId: id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'realm_id'],
    });

    const entity = await query.getMany();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
            },
        },
    });
}
