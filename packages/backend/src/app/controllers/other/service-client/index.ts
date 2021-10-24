/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SwaggerTags} from "typescript-swagger";
import { Controller, Get, Params, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {Client} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import {applyFields, applyFilters, applyPagination} from "typeorm-extension";

@SwaggerTags('service')
@Controller("/service-clients")
export class ServiceClientController {
    @Get("", [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<Client[]> {
        return await getManyRoute(req, res);
    }

    @Get("/:id", [ForceLoggedInMiddleware])
    async get(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Client> {
        return await getRoute(req, res);
    }
}

async function getManyRoute(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to query service-clients.'});
    }

    const {filter, page, fields} = req.query;
    const realmRepository = getRepository(Client);

    const query = realmRepository.createQueryBuilder('client');

    applyFields(query, fields, {
        defaultAlias: 'client',
        allowed: ['id', 'name', 'secret', 'description']
    })

    applyFilters(query, filter, {
        defaultAlias: 'client',
        allowed: ['id', 'service_id']
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

async function getRoute(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to query service-clients.'});
    }

    const {id} = req.params;
    const {fields} = req.query;

    try {
        const repository = getRepository(Client);
        const query =  repository.createQueryBuilder('client')
            .where("client.service_id = :id", {id});

        applyFields(query, fields, {
            defaultAlias: 'client',
            allowed: ['id', 'name', 'secret', 'description']
        });

        const entity = await query.getOne();

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: entity});

    } catch (e) {
        return res._failServerError();
    }
}
