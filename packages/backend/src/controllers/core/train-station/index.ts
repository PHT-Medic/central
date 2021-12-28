/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFilters, applyPagination, applyRelations } from 'typeorm-extension';
import { check, matchedData, validationResult } from 'express-validator';
import {
    PermissionID, Station,
    Train,
    TrainStation,
    TrainStationApprovalStatus,
    isPermittedForResourceRealm, isTrainStationApprovalStatus, onlyRealmPermittedQueryResources,
} from '@personalhealthtrain/ui-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import env from '../../../env';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { DispatcherTrainEventType, emitDispatcherTrainEvent } from '../../../domains/core/train/queue';
import { ExpressValidationError } from '../../../config/http/error/validation';

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, include } = req.query;

    const repository = getRepository(TrainStation);
    const query = await repository.createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.train', 'train')
        .leftJoinAndSelect('trainStation.station', 'station');

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'trainStation.train_realm_id',
        'trainStation.station_realm_id',
    ]);

    const relations = applyRelations(query, include, {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    applyFilters(query, filter, {
        relations,
        defaultAlias: 'trainStation',
        allowed: [
            'train_id',
            'train.id',

            'station_id',
            'station.name',
            'station.realm_id',
        ],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

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

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id, include } = req.params;

    const repository = getRepository(TrainStation);
    const query = repository.createQueryBuilder('trainStation')
        .where('trainStation.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function addRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
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
        .optional({ nullable: true })
        .run(req);

    if (!req.ability.hasPermission(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<TrainStation> = matchedData(req, { includeOptionals: false });

    // train
    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(data.train_id);

    if (typeof train === 'undefined') {
        throw new NotFoundError('The referenced train was not found.');
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError();
    }

    data.train_realm_id = train.realm_id;

    // station
    const stationRepository = getRepository(Station);
    const station = await stationRepository.findOne(data.station_id);

    if (typeof station === 'undefined') {
        throw new NotFoundError('The referenced station was not found.');
    }

    data.station_realm_id = station.realm_id;

    const repository = getRepository(TrainStation);

    let entity = repository.create(data);

    if (env.skipTrainApprovalOperation) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    train.stations += 1;
    await trainRepository.save(train);

    await emitDispatcherTrainEvent({
        event: 'assigned',
        id: entity.train_id,
        stationId: entity.station_id,
        operatorRealmId: req.realmId,
    });

    return res.respondCreated({
        data: entity,
    });
}

export async function editRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError('The train-station id is not valid.');
    }

    const repository = getRepository(TrainStation);
    let trainStation = await repository.findOne(id);

    if (typeof trainStation === 'undefined') {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, trainStation.station_realm_id);
    const isAuthorizedForStation = req.ability.hasPermission(PermissionID.TRAIN_APPROVE);

    const isAuthorityOfTrain = isPermittedForResourceRealm(req.realmId, trainStation.train_realm_id);
    const isAuthorizedForTrain = req.ability.hasPermission(PermissionID.TRAIN_EDIT);

    if (
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfTrain && isAuthorizedForTrain)
    ) {
        throw new ForbiddenError();
    }

    if (isAuthorityOfStation) {
        await check('approval_status')
            .optional({ nullable: true })
            .custom((value) => isTrainStationApprovalStatus(value))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .run(req);
    }

    if (isAuthorityOfTrain) {
        await check('position')
            .exists()
            .isInt()
            .optional({ nullable: true })
            .run(req);
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<TrainStation> = matchedData(req, { includeOptionals: false });

    const entityStatus : string | undefined = trainStation.approval_status;

    trainStation = repository.merge(trainStation, data);

    trainStation = await repository.save(trainStation);

    if (
        data.approval_status &&
        data.approval_status !== entityStatus &&
        isTrainStationApprovalStatus(data.approval_status)
    ) {
        await emitDispatcherTrainEvent({
            event: trainStation.approval_status as DispatcherTrainEventType,
            id: trainStation.train_id,
            stationId: trainStation.station_id,
            operatorRealmId: req.realmId,
        });
    }

    return res.respondCreated({
        data: trainStation,
    });
}

async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT) &&
        !req.ability.hasPermission(PermissionID.TRAIN_APPROVE)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainStation);

    const entity : TrainStation | undefined = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.train_realm_id)
    ) {
        throw new ForbiddenError();
    }

    await repository.remove(entity);

    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(entity.train_id);

    train.stations -= 1;
    await trainRepository.save(train);

    return res.respondDeleted({ data: entity });
}

type PartialTrainStation = Partial<TrainStation>;

@SwaggerTags('pht')
@Controller('/train-stations')
export class TrainStationController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation[]> {
        return await getManyRouteHandler(req, res) as PartialTrainStation[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await getRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Body() data: TrainStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await editRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: Pick<TrainStation, 'station_id' | 'train_id' | 'comment' | 'position' | 'approval_status'>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await addRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await dropRouteHandler(req, res) as PartialTrainStation | undefined;
    }
}
