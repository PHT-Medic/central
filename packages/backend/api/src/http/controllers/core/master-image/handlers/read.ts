import { NotFoundError } from '@typescript-error/http';
import { applyFilters, applyPagination, useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { MasterImageEntity } from '../../../../../domains/core/master-image/entity';

export async function getOneMasterImageRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyMasterImageRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { page, filter } = req.query;

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(MasterImageEntity);
    const query = repository.createQueryBuilder('image');

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'path', 'virtual_path', 'group_virtual_path'],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    query.addOrderBy('image.path', 'ASC');

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
