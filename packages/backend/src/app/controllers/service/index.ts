import {SwaggerTags} from "typescript-swagger";
import {getRepository} from "typeorm";
import {applyRequestFilter, applyRequestIncludes, applyRequestPagination} from "typeorm-extension";
import {check, matchedData, validationResult} from "express-validator";
import {Body, Controller, Get, Params, Post, Request, Response} from "@decorators/express";

import {BaseService, Service} from "../../../domains/service";
import {buildServiceSecurityQueueMessage} from "../../../domains/service/queue";
import {ForceLoggedInMiddleware} from "../../../config/http/middleware/auth";

import {HarborHook, postHarborHookRouteHandler} from "./harbor/hook";

import {doHarborTask} from "./harbor/task";
import {publishQueueMessage} from "../../../modules/message-queue";
import {ServiceSecurityComponent} from "../../../components/service-security";

enum ServiceClientTask {
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

    @Post("/"+BaseService.HARBOR+'/task', [ForceLoggedInMiddleware])
    async execHarborTask(
        @Request() req: any,
        @Response() res: any,
        @Body() harborHook: HarborHook
    ) {
        return doHarborTask(req, res);
    }

    // ------------------------------------------------------------

    @Post("/:id/client/task", [ForceLoggedInMiddleware])
    async doTask(
        @Body() data: {task: ServiceClientTask},
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await doClientTask(req, res);
    }
}

async function getManyRoute(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    const {filter, page, include} = req.query;
    const realmRepository = getRepository(Service);

    const query = realmRepository.createQueryBuilder('service');

    applyRequestIncludes(query, 'service', include, ['client', 'realm']);

    applyRequestFilter(query, filter, ['id']);

    const pagination = applyRequestPagination(query, page, 50);

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

        applyRequestIncludes(query, 'service', include, ['client', 'realm']);

        const entity = await query.getOne();

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: entity});

    } catch (e) {
        return res._failServerError();
    }
}

async function doClientTask(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    await check('task')
        .exists()
        .isIn(Object.values(ServiceClientTask))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    try {
        const repository = getRepository(Service);
        const entity = await repository.findOne(id, {relations: ['client', 'realm']});

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        switch (validationData.task) {
            case ServiceClientTask.SYNC:
                await syncServiceClient(entity);

                entity.client_synced = true;

                await repository.save(entity);
                break;
            case ServiceClientTask.REFRESH_SECRET:
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
    await publishQueueMessage(queueMessage);
}
