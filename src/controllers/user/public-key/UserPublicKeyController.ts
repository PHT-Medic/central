import {getRepository} from "typeorm";
import {UserPublicKey} from "../../../domains/user/public-key";
import {check, matchedData, validationResult} from "express-validator";
import {useVaultApi} from "../../../services/api/provider/vault";

export async function getUserPublicKeyRouteHandler(req: any, res: any) {
    const repository = getRepository(UserPublicKey);

    const entity = await repository.findOne({
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function addUserPublicKeyRouteHandler(req: any, res: any) {
    await check('content').exists().notEmpty().run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    try {
        await useVaultApi().uploadUserPublicKey(req.user.id, data.content);

        const repository = getRepository(UserPublicKey);

        let entity = repository.create({
            user_id: req.user.id,
            ...data
        });

        await repository.save(entity);

        return res._respond({data: entity});
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Der Public Key konnte nicht gespeichert werden...'})
    }
}

export async function editUserPublicKeyRouteHandler(req: any, res: any) {
    const { id } = req.params;

    await check('content').exists().notEmpty().run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(UserPublicKey);

    let entity = await repository.findOne({
        id,
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    entity = repository.merge(entity,data);

    try {
        await useVaultApi().uploadUserPublicKey(req.user.id, data.content);

        await repository.save(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Public Key wurde erfolgreich editiert...'})
    }
}

export async function dropUserPublicKeyRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(UserPublicKey);

    const entity = await repository.findOne({
        id,
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {

        await useVaultApi().dropUserPublicKey(req.user.id);

        await repository.delete(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Public Key konnte nicht gelöscht werden...'})
    }
}
