import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {Station} from "../../../../domains/pht/station";
import {isPermittedToOperateOnRealmResource} from "../../../../modules/auth/utils";
import {
    ensureHarborProject,
    removeHarborProject, removeStationPublicKeyFromVault,
    saveStationPublicKeyToVault
} from "../../../../modules/pht/harbor/api";

export async function doStationTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn([
            'createHarborProject',
            'dropHarborProject',
            'createHarborUser',
            'saveVaultPublicKey',
            'dropVaultPublicKey'
        ])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Station);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    if(!req.ability.can('edit', 'station')) {
        return res._failForbidden();
    }

    switch (validationData.task) {
        case 'createHarborProject':
            try {
                await ensureHarborProject(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'dropHarborProject':
            try {
                await removeHarborProject(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'createHarborUser':
            return res._failBadRequest({message: 'Not supported yet...'})
        case 'saveVaultPublicKey':
            try {
                await saveStationPublicKeyToVault(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'dropVaultPublicKey':
            try {
                await removeStationPublicKeyFromVault(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
    }
}
