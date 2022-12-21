/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmReadableQueryResources } from '@authup/server-database';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/common';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { useRequestEnv } from '../../../../request';

export async function getOneProposalRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal')
        .where('proposal.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'proposal',
        fields: {
            default: [
                'id',
                'title',
                'requested_data',
                'risk',
                'risk_comment',
                'trains',
                'created_at',
                'updated_at',
                'realm_id',
                'user_id',
                'master_image_id',
            ],
        },
        relations: {
            allowed: ['user', 'realm', 'master_image'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyProposalRouteHandler(req: Request, res: Response) : Promise<any> {
    const {
        filter,
    } = useRequestQuery(req);

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal');

    if (filter) {
        let { realm_id: realmId } = filter as Record<string, any>;

        const realm = useRequestEnv(req, 'realm');
        if (!isRealmResourceReadable(realm, realmId)) {
            realmId = realm.id;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filter.realm_id = realmId;
    } else {
        onlyRealmReadableQueryResources(query, useRequestEnv(req, 'realm'), 'proposal.realm_id');
    }

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'proposal',
        fields: {
            default: [
                'id',
                'title',
                'requested_data',
                'risk',
                'risk_comment',
                'trains',
                'created_at',
                'updated_at',
                'realm_id',
                'user_id',
                'master_image_id',
            ],
        },
        filters: {
            allowed: ['id', 'title', 'realm_id', 'user_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['user', 'realm', 'master_image'],
        },
        sort: {
            allowed: ['id', 'updated_at', 'created_at'],
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
