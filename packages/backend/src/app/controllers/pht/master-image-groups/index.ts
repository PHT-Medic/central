/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyFilters, applyPagination} from "typeorm-extension";
import {MasterImageGroup,} from "@personalhealthtrain/ui-common";

import {Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

type PartialMasterImageGroup = Partial<MasterImageGroup>;

@SwaggerTags('pht')
@Controller("/master-image-groups")
export class MasterImageGroupController {
    @Get("",[ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImageGroup[]> {
        return await getManyRouteHandler(req, res) as PartialMasterImageGroup[];
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImageGroup|undefined> {
        return await getRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImageGroup|undefined> {
        return await dropRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }
}

export async function getRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(MasterImageGroup);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function getManyRouteHandler(req: any, res: any) {
    const { page, filter } = req.query;

    const repository = getRepository(MasterImageGroup);
    const query = repository.createQueryBuilder('imageGroup');

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'path', 'virtual_path'],
        defaultAlias: 'imageGroup'
    });

    const pagination = applyPagination(query, page, {maxLimit: 50});

    const [entities, total] = await query.getManyAndCount();

    return res._respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

export async function dropRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('manage', 'masterImageGroup')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(MasterImageGroup);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'The master image could not be deleted.'})
    }
}
