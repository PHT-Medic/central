import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {ProposalStation} from "../../../../../domains/pht/proposal/station";
import {queryFindPermittedResourcesForRealm} from "../../../../../db/utils";
import {Station} from "../../../../../domains/pht/station";
import {isPermittedToOperateOnRealmResource} from "../../../../../modules/auth/utils";
import {Proposal} from "../../../../../domains/pht/proposal";
import {
    ProposalStationStateApproved,
    ProposalStationStateOpen,
    ProposalStationStateRejected
} from "../../../../../domains/pht/proposal/station/states";
import {applyRequestPagination} from "../../../../../db/utils/pagination";
import {applyRequestFilterOnQuery} from "../../../../../db/utils/filter";


export async function getStationProposalsRouteHandler(req: any, res: any, type: string) {
    let { id } = req.params;
    let { filter, page } = req.query;

    switch (type) {
        case 'self':
            try {
                const repository = getRepository(ProposalStation);
                let query = await repository.createQueryBuilder('proposalStation')
                    .leftJoin('proposalStation.station', 'station')
                    .leftJoinAndSelect('proposalStation.proposal', 'proposal') // required by web app
                    .where({
                        station_id: id
                    });

                queryFindPermittedResourcesForRealm(query, req.user.realm_id, 'station.realm_id');

                applyRequestFilterOnQuery(query, filter, {
                    proposal_id: 'proposalStation.proposal_id',
                    station_id: 'proposalStation.station_id'
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
                console.log(e);
                return res._failServerError();
            }
        case 'related':
            try {
                const repository = getRepository(Proposal);

                let query = repository.createQueryBuilder('proposal')
                    .leftJoinAndSelect('proposal.proposalStations', 'proposalStation')
                    .leftJoinAndSelect('proposalStation.station', 'station')
                    .where("proposalStation.station_id = :stationId", {stationId: id});

                queryFindPermittedResourcesForRealm(query, req.user.realm_id, 'station.realm_id');

                applyRequestFilterOnQuery(query, filter, {
                    id: 'station.id',
                    name: 'station.name'
                })

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
}

export async function getStationProposalRouteHandler(req: any, res: any, type: string) {
    let {id, relationId} = req.params;

    let repository;

    try {
        switch (type) {
            case 'self':
                repository = getRepository(ProposalStation);
                let entities = await repository.findOne({
                    proposal_id: relationId,
                    station_id: id
                })

                if (typeof entities === 'undefined') {
                    return res._failNotFound();
                }

                if(!isPermittedToOperateOnRealmResource(req.user, entities)) {
                    return res._failForbidden();
                }

                return res._respond({data: entities});
            case 'related':
                repository = getRepository(Station);

                let entity = await repository.createQueryBuilder('station')
                    .leftJoinAndSelect('station.proposalStations', 'proposalStation')
                    .where("proposalStation.proposal_id = :proposalId", {proposalId: relationId})
                    .where("proposalStation.station_id = :stationId", {stationId: id})
                    .getOne();

                if (typeof entity === 'undefined') {
                    return res._failNotFound();
                }

                if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
                    return res._failForbidden();
                }

                return res._respond({data: entity});
        }
    } catch (e) {
        return res._failServerError();
    }
}

export async function editStationProposalRouteHandler(req: any, res: any) {
    let { relationId } = req.params;

    relationId = parseInt(relationId, 10);

    if(typeof relationId !== "number" || Number.isNaN(relationId)) {
        return res._failBadRequest({message: 'Die Proposal Station ID ist nicht gültig.'});
    }

    await check('comment')
        .exists()
        .isLength({min: 5, max: 2048})
        .optional()
        .run(req);

    await check('status')
        .exists()
        .isIn([ProposalStationStateOpen, ProposalStationStateApproved, ProposalStationStateRejected])
        .run(req);

    // add status check

    if(!req.ability.can('approve','proposal')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    if(!data || Object.keys(data).length === 0) {
        return res._respondAccepted();
    }

    const repository = getRepository(ProposalStation);
    let stationProposal = await repository.findOne(relationId, {relations: ['station']});

    if(typeof stationProposal === 'undefined') {
        return res._failValidationError({message: 'Der eingehende Antrag konnte nicht gefunden werden.'});
    }

    if(!isPermittedToOperateOnRealmResource(req.user, stationProposal.station)) {
        return res._failForbidden();
    }

    stationProposal = repository.merge(stationProposal, data);

    try {
        stationProposal = await repository.save(stationProposal);

        return res._respondCreated({
            data: stationProposal
        });
    } catch (e) {
        return res._failValidationError();
    }
}
