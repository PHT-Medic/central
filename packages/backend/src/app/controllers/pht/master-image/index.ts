/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyFilters, applyPagination} from "typeorm-extension";
import {MasterImage} from "@personalhealthtrain/ui-common";

import {Controller, Delete, Get, Params, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

type PartialMasterImage = Partial<MasterImage>;

@SwaggerTags('pht')
@Controller("/master-images")
export class MasterImageController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialMasterImage[]>([
        {name: 'slim', path: 'master/nf-core/hlaTyping', id: 1, proposals: [], trains: []}
    ])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImage[]> {
        return await getManyRouteHandler(req, res) as PartialMasterImage[];
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialMasterImage>({name: 'slim', path: 'master/nf-core/hlaTyping', id: 1, proposals: [], trains: []})
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImage|undefined> {
        return await getRouteHandler(req, res) as PartialMasterImage | undefined;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialMasterImage>({name: 'slim', path: 'master/nf-core/hlaTyping', id: 1, proposals: [], trains: []})
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImage|undefined> {
        return await dropRouteHandler(req, res) as PartialMasterImage | undefined;
    }
}

export async function getRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(MasterImage);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function getManyRouteHandler(req: any, res: any) {
    const { page, filter } = req.query;

    const repository = getRepository(MasterImage);
    const query = repository.createQueryBuilder('image');

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'path']
    });

    const pagination = applyPagination(query, page, {maxLimit: 50});

    query.addOrderBy("image.path", "ASC");

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

    if(!req.ability.can('manage', 'service')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(MasterImage);

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
