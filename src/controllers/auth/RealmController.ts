import {getRepository} from "typeorm";
import {Realm} from "../../domains/realm";
import {check, matchedData, validationResult} from "express-validator";

export async function getRealmsRoute(req: any, res: any) {
    const realmRepository = getRepository(Realm);

    const result = await realmRepository.find();

    return res._respond({
        data: result
    })
}

export async function getRealmRoute(req: any, res: any) {
    const { id } = req.params;

    if(typeof id !== 'string') {
        return res._failBadRequest();
    }

    const realmRepository = getRepository(Realm);

    const result = await realmRepository.findOne(id);

    if(typeof result === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({
        data: result
    })
}

//---------------------------------------------------------------------------------

async function runValidation(req: any) {
    await check('id').exists().notEmpty().isString().isLength({min: 5, max: 36}).run(req);
    await check('name').exists().notEmpty().isString().isLength({min: 5, max: 100}).run(req);
    await check('description').exists().notEmpty().isString().isLength({min: 5, max: 100}).optional().run(req);
}

//---------------------------------------------------------------------------------

export async function addRealmRoute(req: any, res: any) {
    if(!req.ability.can('add','realm')) {
        return res._failForbidden();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const realmRepository = getRepository(Realm);

    let realm = realmRepository.create(data);

    try {
        await realmRepository.save(realm);

        return res._respond({
            data: realm
        })
    } catch (e) {
        return res._failValidationError({message: 'Der Realm konnte nicht erstellt werden.'});
    }
}

//---------------------------------------------------------------------------------

export async function editRealmRoute(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('edit','realm')) {
        return res._failForbidden();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const realmRepository = getRepository(Realm);

    let realm = await realmRepository.findOne(id);
    if(typeof realm === 'undefined') {
        return res._failNotFound();
    }

    realm = realmRepository.merge(realm, data);

    try {
        await realmRepository.save(realm);

        return res._respond({
            data: realm
        })
    } catch (e) {
        return res._failValidationError({message: 'Der Realm konnte nicht bearbeitet werden.'});
    }
}

//---------------------------------------------------------------------------------

export async function dropRealmRoute(req: any, res: any) {
    let {id} = req.params;

    if (!req.ability.can('drop', 'realm')) {
        return res._failForbidden();
    }

    const repository = getRepository(Realm);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!entity.drop_able) {
        return res._failForbidden({message: 'Der Realm kann nicht gelöscht werden.'})
    }

    try {

        await repository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }
}
