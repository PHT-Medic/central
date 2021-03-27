import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {ProposalStation} from "../../../../../domains/pht/proposal/station";
import {queryFindPermittedResourcesForRealm} from "../../../../../db/utils";
import {Station} from "../../../../../domains/pht/station";
import {isPermittedToOperateOnRealmResource} from "../../../../../modules/auth/utils";
import {applyRequestFilterOnQuery} from "../../../../../db/utils/filter";


export async function getProposalStationsRouteHandler(req: any, res: any, type: string) {
    let { id } = req.params;
    let { filter } = req.query;

    switch (type) {
        case 'self':
            try {
                const repository = getRepository(ProposalStation);
                let query = await repository.createQueryBuilder('proposalStation')
                    .leftJoinAndSelect('proposalStation.station', 'station')
                    .where({
                        proposal_id: id
                    });

                queryFindPermittedResourcesForRealm(query, req.user.realm_id);

                applyRequestFilterOnQuery(query, filter, {
                    proposal_id: 'proposalStation.proposal_id',
                    station_id: 'proposalStation.station_id'
                });

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                const repository = getRepository(Station);

                let query = repository.createQueryBuilder('station')
                    .leftJoinAndSelect('station.proposalStations', 'proposalStation')
                    .where("proposalStation.proposal_id = :proposalId", {proposalId: id});

                applyRequestFilterOnQuery(query, filter, {
                    id: 'station.id',
                    name: 'station.name'
                })

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
    }
}

export async function getProposalStationRouteHandler(req: any, res: any, type: string) {
    let {id, relationId} = req.params;

    let repository;

    try {
        switch (type) {
            case 'self':
                repository = getRepository(ProposalStation);
                let entities = await repository.findOne({
                    station_id: relationId,
                    proposal_id: id
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

                let entity = repository.createQueryBuilder('station')
                    .leftJoinAndSelect('station.proposalStations', 'proposalStation')
                    .where("proposalStation.proposal_id = :proposalId", {proposalId: id})
                    .where("proposalStation.station_id = :stationId", {stationId: relationId})
                    .getOne();

                if (typeof entity === 'undefined') {
                    return res._failNotFound();
                }

                return res._respond({data: entity});
        }
    } catch (e) {
        return res._failServerError();
    }
}

export async function addProposalStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    id = parseInt(id, 10);

    if(typeof id !== "number" || Number.isNaN(id)) {
        return res._failBadRequest({message: 'Die Proposal ID ist nicht gültig.'});
    }

    await check('station_id')
        .exists()
        .isInt()
        .run(req);

    if(!req.ability.can('edit','proposal')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(ProposalStation);
    let entity = repository.create({
        station_id: data.station_id,
        proposal_id: id
    });

    try {
        entity = await repository.save(entity);

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropProposalStationRouteHandler(req: any, res: any, type: 'self' | 'related') {
    let { id, relationId } = req.params;

    if(!req.ability.can('edit','proposal')) {
        return res._failForbidden();
    }

    const repository = getRepository(ProposalStation);

    let entity : ProposalStation | undefined;

    switch (type) {
        case "self":
            entity = await repository.findOne(relationId, {relations: ['station']});
            break;
        case "related":
            entity = await repository.findOne({
                station_id: relationId,
                proposal_id: id
            }, {relations: ['station']})
            break;
    }

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity.station)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
