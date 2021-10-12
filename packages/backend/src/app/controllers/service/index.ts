/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {BaseService, HarborCommand, Service} from "@personalhealthtrain/ui-common";
import {publishMessage} from "amqp-extension";
import {SwaggerTags} from "typescript-swagger";
import {getRepository} from "typeorm";
import {applyFilters, applyIncludes, applyPagination} from "typeorm-extension";
import {Body, Controller, Get, Params, Post, Request, Response} from "@decorators/express";

import {ForceLoggedInMiddleware} from "../../../config/http/middleware/auth";
import {buildServiceSecurityQueueMessage} from "../../../domains/service/queue";

import {HarborHook, postHarborHookRouteHandler} from "./harbor/hook";

import {doHarborCommand} from "./harbor/task";
import {ServiceSecurityComponent} from "../../../components/service-security";

enum ServiceClientCommand {
    SYNC = 'sync',
    REFRESH_SECRET = 'refreshSecret'
}

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

    @Post("/"+BaseService.HARBOR+'/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
        @Request() req: any,
        @Response() res: any,
        @Body() harborHook: HarborHook
    ) {
        return postHarborHookRouteHandler(req, res);
    }

    @Post("/"+BaseService.HARBOR+'/command', [ForceLoggedInMiddleware])
    async execHarborTask(
        @Request() req: any,
        @Response() res: any,
        @Body() data: {command: HarborCommand},
    ) {
        return doHarborCommand(req, res);
    }

    // ------------------------------------------------------------

    @Post("/:id/client/command", [ForceLoggedInMiddleware])
    async doTask(
        @Body() data: {command: ServiceClientCommand},
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await doClientCommand(req, res);
    }
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

const commands = Object.values(ServiceClientCommand);
async function doClientCommand(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    const {command} = req.body;

    if(
        !command ||
        commands.indexOf(command) === -1
    ) {
        return res._failBadRequest({message: 'The client command is not valid.'});
    }

    try {
        const repository = getRepository(Service);
        const entity = await repository.findOne(id, {relations: ['client', 'realm']});

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        switch (command) {
            case ServiceClientCommand.SYNC:
                await syncServiceClient(entity);

                entity.client_synced = true;

                await repository.save(entity);
                break;
            case ServiceClientCommand.REFRESH_SECRET:
                entity.client.refreshSecret();
                entity.client_synced = false;

                await repository.save(entity);
                break;
        }

        return res._respond({data: entity});

    } catch (e) {
        return res._failBadRequest({message: 'The operation was not successful.'});
    }
}

async function syncServiceClient(entity: Service) {
    const queueMessage = buildServiceSecurityQueueMessage(
        ServiceSecurityComponent.SYNC,
        entity.id,
        {
            id: entity.client.id,
            secret: entity.client.secret
        }
    );

    await publishMessage(queueMessage);
}
