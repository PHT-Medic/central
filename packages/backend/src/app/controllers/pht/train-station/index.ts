/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { check, matchedData, validationResult } from 'express-validator';
import {
    PermissionID, Train, TrainStation,
    TrainStationApprovalStatus,
    isPermittedForResourceRealm,
    isTrainStationApprovalStatus,
    onlyRealmPermittedQueryResources,
} from '@personalhealthtrain/ui-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import env from '../../../../env';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { DispatcherTrainEventType, emitDispatcherTrainEvent } from '../../../../domains/pht/train/queue';
import { ExpressValidationError } from '../../../../config/http/error/validation';

type PartialTrainStation = Partial<TrainStation>;
const simpleExample = {
    train_id: 'xxx', station_id: 1, comment: 'Looks good to me', status: TrainStationApprovalStatus.APPROVED,
};

@SwaggerTags('pht')
@Controller('/train-stations')
export class TrainStationController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialTrainStation[]> {
        return await getTrainStationsRouteHandler(req, res) as PartialTrainStation[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialTrainStation|undefined> {
        return await getTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: TrainStation,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialTrainStation|undefined> {
        return await editTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async add(
        @Body() data: TrainStation,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialTrainStation|undefined> {
        return await addTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainStation>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialTrainStation|undefined> {
        return await dropTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }
}

export async function getTrainStationsRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    const repository = getRepository(TrainStation);
    const query = await repository.createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.train', 'train')
        .leftJoinAndSelect('trainStation.station', 'station');

    onlyRealmPermittedQueryResources(query, req.realmId, ['train.realm_id', 'station.realm_id']);

    applyFilters(query, filter, {
        defaultAlias: 'trainStation',
        allowed: ['train_id', 'station_id'],
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

export async function getTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(TrainStation);
    const entity = await repository.findOne(id, { relations: ['train', 'station'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
        && !isPermittedForResourceRealm(req.realmId, entity.station.realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function addTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
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

    const data = matchedData(req, { includeOptionals: false });

    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(data.train_id);

    if (typeof train === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainStation);

    let entity = repository.create(data);

    if (env.skipTrainApprovalOperation) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

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

export async function editTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError('The train-station id is not valid.');
    }

    const repository = getRepository(TrainStation);
    let trainStation = await repository.findOne(id, { relations: ['station', 'train'] });

    if (typeof trainStation === 'undefined') {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, trainStation.station.realm_id);
    const isAuthorizedForStation = req.ability.can('approve', 'train');

    const isAuthorityOfRealm = isPermittedForResourceRealm(req.realmId, trainStation.train.realm_id);
    const isAuthorizedForRealm = req.ability.can('edit', 'train');

    if (
        !(isAuthorityOfStation && isAuthorizedForStation)
        && !(isAuthorityOfRealm && isAuthorizedForRealm)
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

    if (isAuthorityOfRealm) {
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

    const data = matchedData(req, { includeOptionals: false });

    const entityStatus : string | undefined = trainStation.approval_status;

    trainStation = repository.merge(trainStation, data);

    trainStation = await repository.save(trainStation);

    if (
        data.approval_status
        && data.approval_status !== entityStatus
        && isTrainStationApprovalStatus(data.approval_status)
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

export async function dropTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
        && !req.ability.hasPermission(PermissionID.TRAIN_APPROVE)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainStation);

    const entity : TrainStation | undefined = await repository.findOne(id, { relations: ['train', 'station'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.station.realm_id)
        && !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        throw new ForbiddenError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
