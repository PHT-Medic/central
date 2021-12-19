/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { In, getRepository } from 'typeorm';
import {
    applyFilters, applyPagination, applyRelations, applySort,
} from 'typeorm-extension';
import {
    MasterImage,
    PermissionID, Proposal,
    ProposalStation,
    ProposalStationApprovalStatus,
    Station,
    isPermittedForResourceRealm,
    onlyRealmPermittedQueryResources,
} from '@personalhealthtrain/ui-common';
import { check, matchedData, validationResult } from 'express-validator';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from '@trapi/swagger';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import env from '../../../env';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { DispatcherProposalEvent, emitDispatcherProposalEvent } from '../../../domains/core/proposal/queue';
import { ExpressValidationError } from '../../../config/http/error/validation';

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

    const repository = getRepository(Proposal);
    const query = repository.createQueryBuilder('proposal')
        .where('proposal.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'proposal',
        allowed: ['master_image', 'realm', 'user'],
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    // todo: permit resource to realm/station owner XAND receiving realm/station OR to all
    /*
    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }
     */

    return res.respond({ data: entity });
}

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include,
    } = req.query;

    const repository = getRepository(Proposal);
    const query = repository.createQueryBuilder('proposal');

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFilters(query, filter, {
        defaultAlias: 'proposal',
        allowed: ['id', 'title', 'realm_id'],
    });

    applySort(query, sort, {
        defaultAlias: 'proposal',
        allowed: ['id', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'proposal',
        allowed: ['user', 'realm'],
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

export async function addRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.PROPOSAL_ADD)) {
        throw new ForbiddenError();
    }

    await check('title')
        .exists()
        .isLength({ min: 5, max: 100 })
        .run(req);

    await check(['requested_data', 'risk_comment'])
        .exists()
        .isLength({ min: 10, max: 2048 })
        .run(req);

    await check('risk')
        .exists()
        .isString()
        .isIn(['low', 'mid', 'high'])
        .run(req);

    await check('master_image_id')
        .exists()
        .isString()
        .custom((value) => getRepository(MasterImage).findOne(value).then((masterImageResult) => {
            if (typeof masterImageResult === 'undefined') throw new Error('The provided master image does not exist.');
        }))
        .run(req);
    await check('station_ids')
        .isArray()
        .custom((value: any[]) => getRepository(Station).find({ id: In(value) }).then((stationResult) => {
            if (!stationResult || stationResult.length !== value.length) throw new Error('The provided stations are not valid.');
        }))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: false });

    const { station_ids: stationIds, ...data } = validationData;

    const repository = getRepository(Proposal);
    const entity = repository.create({
        realm_id: req.realmId,
        user_id: req.user.id,
        ...data,
    });
    await repository.save(entity);

    const proposalStationRepository = getRepository(ProposalStation);
    const proposalStations = stationIds.map((stationId: number) => proposalStationRepository.create({
        proposal_id: entity.id,
        station_id: stationId,
        approval_status: env.skipProposalApprovalOperation ? ProposalStationApprovalStatus.APPROVED : null,
    }));

    await proposalStationRepository.save(proposalStations);

    const proposalStationPromise = Promise.all(stationIds.map((stationId: string | number) => emitDispatcherProposalEvent({
        event: DispatcherProposalEvent.ASSIGNED,
        id: entity.id,
        stationId,
        operatorRealmId: req.realmId,
    })));

    await proposalStationPromise;

    return res.respond({ data: entity });
}

async function editRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_EDIT)) {
        throw new ForbiddenError();
    }

    await check('title')
        .exists()
        .isLength({ min: 5, max: 100 })
        .optional()
        .run(req);

    await check(['requested_data', 'risk_comment'])
        .exists()
        .isLength({ min: 10, max: 2048 })
        .optional()
        .run(req);

    await check('risk')
        .exists()
        .isString()
        .optional()
        .isIn(['low', 'mid', 'high'])
        .run(req);

    await check('master_image_id')
        .exists()
        .isString()
        .optional()
        .custom((value) => getRepository(MasterImage).findOne(value).then((masterImageResult) => {
            if (typeof masterImageResult === 'undefined') throw new Error('The specified master image does not exist.');
        }))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req);
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(Proposal);
    let proposal = await repository.findOne(id);

    if (typeof proposal === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, proposal.realm_id)) {
        throw new ForbiddenError();
    }

    proposal = repository.merge(proposal, data);

    const result = await repository.save(proposal);

    return res.respondAccepted({
        data: result,
    });
}

async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(Proposal);
    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}

type PartialProposal = Partial<Proposal>;
const simpleExample = {
    title: 'An example Proposal', risk: 'low', risk_comment: 'The risk is low', requested_data: 'all', realm_id: 'master',
};

@SwaggerTags('pht')
@Controller('/proposals')
export class ProposalController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialProposal[]>([simpleExample])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal[]> {
        return await getManyRouteHandler(req, res) as PartialProposal[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialProposal>(simpleExample)
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await getRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialProposal>(simpleExample)
    async update(
        @Params('id') id: string,
            @Body() data: Proposal,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await editRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialProposal>(simpleExample)
    async add(
        @Body() data: Proposal,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await addRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialProposal>(simpleExample)
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await dropRouteHandler(req, res) as PartialProposal | undefined;
    }
}
