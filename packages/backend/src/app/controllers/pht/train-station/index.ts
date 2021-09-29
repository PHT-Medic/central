/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyFilters, applyPagination} from "typeorm-extension";
import {check, matchedData, validationResult} from "express-validator";
import {Train, TrainStation} from "@personalhealthtrain/ui-common";
import {DispatcherTrainEventType, emitDispatcherTrainEvent} from "../../../../domains/pht/train/queue";

import {
    isPermittedForResourceRealm,
    onlyRealmPermittedQueryResources
} from "@personalhealthtrain/ui-common";
import {
    isTrainStationApprovalStatus,
    TrainStationApprovalStatus,
    TrainStationApprovalStatusType
} from "@personalhealthtrain/ui-common";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import env from "../../../../env";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

type PartialTrainStation = Partial<TrainStation>;
const simpleExample = {train_id: 'xxx', station_id: 1, comment: 'Looks good to me', status: TrainStationApprovalStatus.APPROVED};

@SwaggerTags('pht')
@Controller("/train-stations")
export class TrainStationController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainStation[]> {
        return await getTrainStationsRouteHandler(req, res) as PartialTrainStation[];
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainStation|undefined> {
        return await getTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: TrainStation,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainStation|undefined> {
        return await editTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async add(
        @Body() data: TrainStation,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainStation|undefined> {
        return await addTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainStation|undefined> {
        return await dropTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }
}

export async function getTrainStationsRouteHandler(req: any, res: any) {
    const { filter, page } = req.query;

    try {
        const repository = getRepository(TrainStation);
        const query = await repository.createQueryBuilder('trainStation')
            .leftJoinAndSelect('trainStation.train', 'train')
            .leftJoinAndSelect('trainStation.station', 'station');

        onlyRealmPermittedQueryResources(query, req.realmId, ['train.realm_id', 'station.realm_id']);

        applyFilters(query, filter, {
            queryAlias: 'trainStation',
            allowed: ['train_id', 'station_id']
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
    } catch (e) {
        console.log(e);
        return res._failServerError();
    }
}

export async function getTrainStationRouteHandler(req: any, res: any) {
    const {id} = req.params;

    try {
        const repository = getRepository(TrainStation);
        const entity = await repository.findOne(id, {relations: ['train', 'station']});

        if (typeof entity === 'undefined') {
            return res._failNotFound();
        }

        if(
            !isPermittedForResourceRealm(req.realmId, entity.train.realm_id) &&
            !isPermittedForResourceRealm(req.realmId, entity.station.realm_id)
        ) {
            return res._failForbidden();
        }

        return res._respond({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}

export async function addTrainStationRouteHandler(req: any, res: any) {
    await check('station_id')
        .exists()
        .isInt()
        .run(req);

    await check('train_id')
        .exists()
        .isString()
        .run(req);

    await check('position')
        .exists()
        .isInt()
        .optional({nullable: true})
        .run(req);

    if(!req.ability.can('edit','train')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(data.train_id);

    if(typeof train === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        return res._failForbidden();
    }

    const repository = getRepository(TrainStation);

    let entity = repository.create(data);

    if(env.demo) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    try {
        entity = await repository.save(entity);

        await emitDispatcherTrainEvent( {
            event: 'assigned',
            id: entity.train_id,
            stationId: entity.station_id,
            operatorRealmId: req.realmId
        });

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function editTrainStationRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(typeof id !== "string") {
        return res._failBadRequest({message: 'the train-station id is not valid.'});
    }

    const repository = getRepository(TrainStation);
    let trainStation = await repository.findOne(id, {relations: ['station', 'train']});

    if(typeof trainStation === 'undefined') {
        return res._failNotFound();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, trainStation.station.realm_id);
    const isAuthorizedForStation = req.ability.can('approve','train');

    const isAuthorityOfRealm = isPermittedForResourceRealm(req.realmId, trainStation.train.realm_id);
    const isAuthorizedForRealm = req.ability.can('edit','train');

    if(
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfRealm && isAuthorizedForRealm)
    ) {
        return res._failForbidden();
    }

    if(isAuthorityOfStation) {
        await check('status')
            .optional()
            .custom(value => isTrainStationApprovalStatus(value))
            .run(req);

        await check('comment')
            .optional({nullable: true})
            .isString()
            .run(req);
    }

    if(isAuthorityOfRealm) {
        await check('position')
            .exists()
            .isInt()
            .optional({nullable: true})
            .run(req);
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const entityStatus : string | undefined = trainStation.approval_status;

    trainStation = repository.merge(trainStation, data);

    try {
        trainStation = await repository.save(trainStation);

        if(
            data.status &&
            data.status !== entityStatus &&
            ['approved', 'rejected'].indexOf(data.status as TrainStationApprovalStatusType) !== -1
        ) {
            await emitDispatcherTrainEvent({
                event: trainStation.approval_status as DispatcherTrainEventType,
                id: trainStation.train_id,
                stationId: trainStation.station_id,
                operatorRealmId: req.realmId
            });
        }

        return res._respondCreated({
            data: trainStation
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropTrainStationRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('edit', 'train') && !req.ability.can('approve', 'train')) {
        return res._failForbidden();
    }

    const repository = getRepository(TrainStation);

    const entity : TrainStation | undefined = await repository.findOne(id, {relations: ['train', 'station']});

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(
        !isPermittedForResourceRealm(req.realmId, entity.station.realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
