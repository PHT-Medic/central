import {getRepository, In} from "typeorm";
import {Station} from "../../../../domains/pht/station";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../../../db/utils";
import {check, matchedData, validationResult} from "express-validator";
import {Proposal} from "../../../../domains/pht/proposal";
import {isPermittedToOperateOnRealmResource} from "../../../../modules/auth/utils";
import {MasterImage} from "../../../../domains/pht/master-image";
import {ProposalStation} from "../../../../domains/pht/proposal/station";

export async function getProposalRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(Proposal);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getProposalsRouteHandler(req: any, res: any) {
    let { filter } = req.query;

    const repository = getRepository(Proposal);
    const query = repository.createQueryBuilder('proposal');

    queryFindPermittedResourcesForRealm(query, req.user.realm_id);

    applyRequestFilterOnQuery(query, filter, {
        id: 'proposal.id',
        name: 'proposal.name',
        realmId: 'proposal.realm_id'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function addProposalRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','proposal')) {
        return res._failForbidden();
    }

    await check('title')
        .exists()
        .isLength({min: 5, max: 100})
        .run(req);

    await check(['requested_data','risk_comment'])
        .exists()
        .isLength({min: 10, max: 2048})
        .run(req);

    await check('risk')
        .exists()
        .isString()
        .isIn(['low','mid','high'])
        .run(req);

    await check('master_image_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(MasterImage).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('Das Master Image existiert nicht.');
            })
        })
        .run(req);
    await check('station_ids')
        .isArray()
        .custom((value: any[]) => {
            return getRepository(Station).find({id: In(value)}).then((res) => {
                if(!res || res.length !== value.length) throw new Error('Die angegebenen Krankenhäuser sind nicht gültig');
            })
        })
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: false});

    const {station_ids, ...data} = validationData;

    try {
        const repository = getRepository(Proposal);
        let entity = repository.create({
            realm_id: req.user.realm_id,
            user_id: req.user.id,
            ...data
        });
        await repository.save(entity);

        const proposalStationRepository = getRepository(ProposalStation);
        const proposalStations = station_ids.map((stationId: number) => {
            return proposalStationRepository.create({
                proposal_id: entity.id,
                station_id: stationId,
                status: 'open'
            });
        });

        await proposalStationRepository.save(proposalStations);

        return res._respond({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Antrag konnte nicht erstellt werden...'})
    }
}

export async function editProposalRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('edit','proposal')) {
        return res._failForbidden();
    }

    await check('title')
        .exists()
        .isLength({min: 5, max: 100})
        .optional()
        .run(req);

    await check(['requested_data','risk_comment'])
        .exists()
        .isLength({min: 10, max: 2048})
        .optional()
        .run(req);

    await check('risk')
        .exists()
        .isString()
        .optional()
        .isIn(['low','mid','high'])
        .run(req);

    await check('master_image_id')
        .exists()
        .isInt()
        .optional()
        .custom(value => {
            return getRepository(MasterImage).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('Das Master Image existiert nicht.');
            })
        })
        .run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req);
    if(!data) {
        return res._respondAccepted();
    }

    const repository = getRepository(Proposal);
    let proposal = await repository.findOne(id);

    if(typeof proposal === 'undefined') {
        return res._failValidationError({message: 'Der Antrag konnte nicht gefunden werden.'});
    }

    if(!isPermittedToOperateOnRealmResource(req.user, proposal)) {
        return res._failForbidden();
    }

    proposal = repository.merge(proposal, data);

    try {
        const result = await repository.save(proposal);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'Der Antrag konnte nicht aktualisiert werden.'});
    }
}

export async function dropProposalRouteHandler(req: any, res: any) {
    let { id } = req.params;

    id = parseInt(id);

    if(typeof id !== 'number' || Number.isNaN(id)) {
        return res._failNotFound();
    }

    if(!req.ability.can('drop', 'proposal')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(Proposal);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Antrag konnte nicht gelöscht werden...'})
    }
}
