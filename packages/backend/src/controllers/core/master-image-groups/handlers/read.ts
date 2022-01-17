import { NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { MasterImageGroupEntity } from '../../../../domains/core/master-image-group/entity';

export async function getOneMasterImageGroupRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(MasterImageGroupEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyMasterImageGroupRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { page, filter } = req.query;

    const repository = getRepository(MasterImageGroupEntity);
    const query = repository.createQueryBuilder('imageGroup');

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'path', 'virtual_path'],
        defaultAlias: 'imageGroup',
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}
