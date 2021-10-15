/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {StaticService, RegistryCommand, Service} from "@personalhealthtrain/ui-common";
import {SwaggerTags} from "typescript-swagger";
import {getRepository} from "typeorm";
import {applyFilters, applyIncludes, applyPagination} from "typeorm-extension";
import {Body, Controller, Get, Params, Post, Request, Response} from "@decorators/express";

import {ForceLoggedInMiddleware} from "../../../config/http/middleware/auth";
import {HarborHook, postHarborHookRouteHandler} from "./registry/hook";

import {doRegistryCommand} from "./registry/command";
import {handleServiceClientCommand, ServiceClientCommand} from "./client";

@SwaggerTags('service')
@Controller("/services")
export class ServiceController {
    @Get("", [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<Service[]> {
        return await getManyRoute(req, res);
    }

    @Get("/:id", [ForceLoggedInMiddleware])
    async get(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await getRoute(req, res);
    }

    // ------------------------------------------------------------

    @Post("/:id/client-command", [ForceLoggedInMiddleware])
    async doTask(
        @Body() data: {command: ServiceClientCommand},
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await handleServiceClientCommand(req, res);
    }

    // ------------------------------------------------------------

    @Post("/"+StaticService.REGISTRY+'/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
        @Request() req: any,
        @Response() res: any,
        @Body() harborHook: HarborHook
    ) {
        return postHarborHookRouteHandler(req, res);
    }

    @Post("/"+StaticService.REGISTRY+'/command', [ForceLoggedInMiddleware])
    async execHarborTask(
        @Request() req: any,
        @Response() res: any,
        @Body() data: {command: RegistryCommand},
    ) {
        return doRegistryCommand(req, res);
    }

    // ------------------------------------------------------------
}

async function getManyRoute(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    const {filter, page, include} = req.query;
    const realmRepository = getRepository(Service);

    const query = realmRepository.createQueryBuilder('service');

    applyIncludes(query, include, {
        queryAlias: 'service',
        allowed: ['client', 'realm']
    });

    applyFilters(query, filter, {
        queryAlias: 'service',
        allowed: ['id']
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
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    const {id} = req.params;
    const {include} = req.query;

    try {
        const repository = getRepository(Service);
        const query =  repository.createQueryBuilder('service')
            .where("service.id = :id", {id});

        applyIncludes(query, include, {
            queryAlias: 'service',
            allowed: ['client', 'realm']
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
