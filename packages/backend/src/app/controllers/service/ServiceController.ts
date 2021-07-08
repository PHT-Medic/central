import {SwaggerTags} from "typescript-swagger";
import {applyRequestFilter, applyRequestIncludes, applyRequestPagination} from "typeorm-extension";

import {Body, Controller, Get, Post, Request, Response} from "@decorators/express";
import {BaseService, Service} from "../../../domains/service";
import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {HarborHook, postHarborHookRouteHandler} from "./harbor/HarborController";
import {createSelfServiceSyncQMCommand, publishSelfQM} from "../../../domains/service/queue";
import {ForceLoggedInMiddleware} from "../../../config/http/middleware/auth";

enum ServiceTask {
    SYNC_CLIENT = 'syncClient',
    REFRESH_CLIENT_SECRET = 'refreshClientSecret'
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
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await getRoute(req, res);
    }

    @Post("/:id/task", [ForceLoggedInMiddleware])
    async doTask(
        @Body() data: {task: ServiceTask},
        @Request() req: any,
        @Response() res: any
    ): Promise<Service> {
        return await doTask(req, res);
    }

    @Post("/"+BaseService.HARBOR+'/hook', [ForceLoggedInMiddleware])
    async post(
        @Request() req: any,
        @Response() res: any,
        @Body() harborHook: HarborHook
    ) {
        return postHarborHookRouteHandler(req, res);
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
            .where("id = :id", {id});

        applyRequestIncludes(query, 'service', include, ['client', 'realm']);

        const entity = await query.getOne();

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: entity});

    } catch (e) {
        return res._failNotFound();
    }
}

async function doTask(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage services.'});
    }

    await check('task')
        .exists()
        .isIn(Object.values(ServiceTask))
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
            case ServiceTask.SYNC_CLIENT:
                await syncServiceClient(entity);

                entity.client_synced = true;

                await repository.save(entity);
                break;
            case ServiceTask.REFRESH_CLIENT_SECRET:
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
    const queueMessage = createSelfServiceSyncQMCommand(
        entity.id,
        {
            id: entity.client.id,
            secret: entity.client.secret
        }
    );
    await publishSelfQM(queueMessage);
}
