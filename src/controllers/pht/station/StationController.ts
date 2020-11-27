import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {Station} from "../../../domains/pht/station";
import {applyRequestFilterOnQuery} from "../../../db/utils";
import {Realm} from "../../../domains/realm";

export async function getStationRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(Station);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function getStationsRouteHandler(req: any, res: any) {
    let { filter } = req.query;

    const repository = getRepository(Station);
    const query = repository.createQueryBuilder('station')
        .leftJoinAndSelect('station.realm', 'realm');

    applyRequestFilterOnQuery(query, filter, {
        id: 'station.id',
        name: 'station.name',
        realmId: 'station.realm_id'
    });

    const entity = await query.getMany();

    return res._respond({data: entity})
}

export async function addStationRouteHandler(req: any, res: any) {
    await check('name').isLength({min: 5, max: 100}).exists().notEmpty().run(req);
    await check('realm_id').exists().notEmpty().run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError({validation});
    }

    const data = matchedData(req, {includeOptionals: false});

    try {
        const repository = getRepository(Station);

        let entity = repository.create(data);

        await repository.save(entity);

        entity.realm = await getRepository(Realm).findOne(entity.realm_id);

        return res._respond({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Station konnte nicht erstellt werden...'})
    }
}

export async function editStationRouteHandler(req: any, res: any) {
    const { id } = req.params;

    await check('name').isLength({min: 5, max: 100}).exists().notEmpty().optional().run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const repository = getRepository(Station);
    let role = await repository.findOne(id);

    if(typeof role === 'undefined') {
        return res._failValidationError({message: 'Die Station konnte nicht gefunden werden.'});
    }

    role = repository.merge(role, data);

    try {
        const result = await repository.save(role);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'Die Station konnte nicht aktualisiert werden.'});
    }
}

export async function dropStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    id = parseInt(id);

    if(typeof id !== 'number' || Number.isNaN(id)) {
        return res._failNotFound();
    }

    if(req.ability.can('drop', 'station')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(Station);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {
        await repository.delete(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Station konnte nicht gelöscht werden...'})
    }
}
