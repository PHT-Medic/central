import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {ProposalStation} from "../../../../domains/pht/proposal/station";
import {onlyRealmPermittedQueryResources} from "../../../../db/utils";
import {isRealmPermittedForResource} from "../../../../modules/auth/utils";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";
import {isProposalStationState, ProposalStationStateApproved} from "../../../../domains/pht/proposal/station/states";
import {applyRequestPagination} from "../../../../db/utils/pagination";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../modules/http/request/middleware/authMiddleware";
import {ResponseExample, SwaggerTags} from "typescript-swagger";

type PartialProposalStation = Partial<ProposalStation>;
const simpleExample = {proposal_id: 1, station_id: 1, comment: 'Looks good to me', status: ProposalStationStateApproved};

@SwaggerTags('pht')
@Controller("/proposal-stations")
export class ProposalStationController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<Array<PartialProposalStation>>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<Array<PartialProposalStation>> {
        return await getProposalStationsRouteHandler(req, res) as Array<PartialProposalStation>;
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async add(
        @Body() data: Pick<ProposalStation, 'station_id' | 'proposal_id'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await addProposalStationRouteHandler(req, res) as PartialProposalStation | undefined;
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await getProposalStationRouteHandler(req, res) as PartialProposalStation | undefined;
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: Pick<ProposalStation, 'station_id' | 'proposal_id' | 'comment'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await editProposalStationRouteHandler(req, res) as PartialProposalStation | undefined;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialProposalStation>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialProposalStation|undefined> {
        return await dropProposalStationRouteHandler(req, res) as PartialProposalStation | undefined;
    }
}

export async function getProposalStationsRouteHandler(req: any, res: any) {
    let { filter, page } = req.query;

    try {
        const repository = getRepository(ProposalStation);
        let query = await repository.createQueryBuilder('proposalStation')
            .leftJoinAndSelect('proposalStation.station', 'station')
            .leftJoinAndSelect('proposalStation.proposal', 'proposal');

        onlyRealmPermittedQueryResources(query, req.user.realm_id, [
            'station.realm_id',
            'proposal.realm_id'
        ]);

        applyRequestFilterOnQuery(query, filter, {
            proposalId: 'proposalStation.proposal_id',
            stationId: 'proposalStation.station_id'
        });

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
    } catch (e) {
        return res._failServerError();
    }
}

export async function getProposalStationRouteHandler(req: any, res: any) {
    let {id} = req.params;

    let repository;

    try {
        repository = getRepository(ProposalStation);
        let entity = await repository.findOne(id, {relations: ['station', 'proposal']})

        if (typeof entity === 'undefined') {
            return res._failNotFound();
        }

        if(!isRealmPermittedForResource(req.user, entity.station) && !isRealmPermittedForResource(req.user, entity.proposal)) {
            return res._failForbidden();
        }

        return res._respond({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}

export async function addProposalStationRouteHandler(req: any, res: any) {
    await check('proposal_id')
        .exists()
        .isInt()
        .run(req);

    await check('station_id')
        .exists()
        .isInt()
        .run(req);

    if(!req.ability.can('edit','proposal') && !req.ability.can('add', 'proposal')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(ProposalStation);
    let entity = repository.create(data);

    try {
        entity = await repository.save(entity);

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function editProposalStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if(typeof id !== "string") {
        return res._failBadRequest({message: 'the proposal-station id is not valid.'});
    }

    const repository = getRepository(ProposalStation);
    let proposalStation = await repository.findOne(id, {relations: ['station', 'proposal']});

    if(typeof proposalStation === 'undefined') {
        return res._failNotFound();
    }

    const isAuthorityOfStation = isRealmPermittedForResource(req.user, proposalStation.station);
    const isAuthorizedForStation = req.ability.can('approve','proposal');

    const isAuthorityOfRealm = isRealmPermittedForResource(req.user, proposalStation.proposal);
    const isAuthorizedForRealm = req.ability.can('edit','proposal');

    if(
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfRealm && isAuthorizedForRealm)
    ) {
        return res._failForbidden({message: ''});
    }

    if(isAuthorityOfStation) {
        await check('status')
            .optional()
            .custom(value => isProposalStationState(value))
            .run(req);

        await check('comment')
            .optional({nullable: true})
            .isString()
            .run(req);
    }

    if(isAuthorityOfRealm) {

    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    proposalStation = repository.merge(proposalStation, data);

    try {
        proposalStation = await repository.save(proposalStation);

        return res._respondCreated({
            data: proposalStation
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropProposalStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if(!req.ability.can('edit','proposal') && !req.ability.can('add','proposal')) {
        return res._failForbidden();
    }

    const repository = getRepository(ProposalStation);

    let entity : ProposalStation | undefined = await repository.findOne(id, {relations: ['station']});

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity.station)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
