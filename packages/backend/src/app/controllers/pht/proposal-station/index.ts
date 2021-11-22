/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyFilters, applyPagination} from "typeorm-extension";
import {check, matchedData, validationResult} from "express-validator";
import {DispatcherProposalEvent, emitDispatcherProposalEvent} from "../../../../domains/pht/proposal/queue";
import {
    isPermittedForResourceRealm, isProposalStationApprovalStatus,
    onlyRealmPermittedQueryResources, PermissionID,
    ProposalStation, ProposalStationApprovalStatus
} from "@personalhealthtrain/ui-common";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import env from "../../../../env";
import {ExpressRequest, ExpressResponse} from "../../../../config/http/type";
import {BadRequestError, ForbiddenError, NotFoundError} from "@typescript-error/http";
import {ExpressValidationError} from "../../../../config/http/error/validation";

type PartialProposalStation = Partial<ProposalStation>;
const simpleExample = {proposal_id: 1, station_id: 1, comment: 'Looks good to me', status: ProposalStationApprovalStatus.APPROVED};

@SwaggerTags('pht')
@Controller("/proposal-stations")
export class ProposalStationController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation[]> {
        return await getProposalStationsRouteHandler(req, res);
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async add(
        @Body() data: Pick<ProposalStation, 'station_id' | 'proposal_id'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await addProposalStationRouteHandler(req, res);
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await getProposalStationRouteHandler(req, res);
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: Pick<ProposalStation, 'station_id' | 'proposal_id' | 'comment'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await editProposalStationRouteHandler(req, res);
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await dropProposalStationRouteHandler(req, res);
    }
}

export async function getProposalStationsRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    // tslint:disable-next-line:prefer-const
    let { filter, page } = req.query;

    const repository = getRepository(ProposalStation);
    const query = await repository.createQueryBuilder('proposalStation')
        .leftJoinAndSelect('proposalStation.station', 'station')
        .leftJoinAndSelect('proposalStation.proposal', 'proposal');

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'station.realm_id',
        'proposal.realm_id'
    ]);

    applyFilters(query, filter, {
        allowed: ['proposal_id', 'station_id'],
        defaultAlias: 'proposalStation'
    });

    const pagination = applyPagination(query, page, {maxLimit: 50});

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });

}

export async function getProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {id} = req.params;

    let repository;

    repository = getRepository(ProposalStation);
    const entity = await repository.findOne(id, {relations: ['station', 'proposal']})

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if(
        !isPermittedForResourceRealm(req.realmId, entity.station.realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.proposal.realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({data: entity});
}

export async function addProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    await check('proposal_id')
        .exists()
        .isInt()
        .run(req);

    await check('station_id')
        .exists()
        .isInt()
        .run(req);

    if(
        !req.ability.hasPermission(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.hasPermission(PermissionID.PROPOSAL_ADD)
    ) {
        throw new ForbiddenError('You are not allowed to add a proposal station.');
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(ProposalStation);
    let entity = repository.create(data);

    if(env.skipProposalApprovalOperation) {
        entity.approval_status = ProposalStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    await emitDispatcherProposalEvent({
        event: DispatcherProposalEvent.ASSIGNED,
        id: entity.proposal_id,
        stationId: entity.station_id,
        operatorRealmId: req.realmId
    });

    return res.respondCreated({
        data: entity
    });

}

export async function editProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if(typeof id !== "string") {
        throw new BadRequestError('The proposal-station id is not valid.');
    }

    const repository = getRepository(ProposalStation);
    let proposalStation = await repository.findOne(id, {relations: ['station', 'proposal']});

    if(typeof proposalStation === 'undefined') {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, proposalStation.station.realm_id);
    const isAuthorizedForStation = req.ability.can('approve','proposal');

    const isAuthorityOfRealm = isPermittedForResourceRealm(req.realmId, proposalStation.proposal.realm_id);
    const isAuthorizedForRealm = req.ability.can('edit','proposal');

    if(
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfRealm && isAuthorizedForRealm)
    ) {
        throw new ForbiddenError();
    }

    if(isAuthorityOfStation) {
        await check('approval_status')
            .optional()
            .custom(command => isProposalStationApprovalStatus(command))
            .run(req);

        await check('comment')
            .optional({nullable: true})
            .isString()
            .run(req);
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const entityStatus : string | undefined = proposalStation.approval_status;

    proposalStation = repository.merge(proposalStation, data);

    proposalStation = await repository.save(proposalStation);

    if(
        data.approval_status &&
        data.approval_status !== entityStatus &&
        Object.values(ProposalStationApprovalStatus).includes(data.approval_status)
    ) {
        await emitDispatcherProposalEvent({
            event: proposalStation.approval_status as unknown as DispatcherProposalEvent,
            id: proposalStation.proposal_id,
            stationId: proposalStation.station_id,
            operatorRealmId: req.realmId
        });
    }

    return res.respondCreated({
        data: proposalStation
    });

}

export async function dropProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if(
        !req.ability.hasPermission(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.hasPermission(PermissionID.PROPOSAL_ADD)
    ) {
        throw new ForbiddenError('You are not allowed to drop a proposal station.');
    }

    const repository = getRepository(ProposalStation);

    const entity : ProposalStation | undefined = await repository.findOne(id, {
        relations: ['station', 'proposal']
    });

    if(typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if(
        !isPermittedForResourceRealm(req.realmId, entity.station.realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.proposal.realm_id)
    ) {
        throw new ForbiddenError('You are not authorized to drop this proposal station.');
    }

    await repository.delete(entity.id);

    return res.respondDeleted({data: entity});
}
