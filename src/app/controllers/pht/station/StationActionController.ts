import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {Station} from "../../../../domains/pht/station";
import {isPermittedToOperateOnRealmResource} from "../../../../modules/auth/utils";
import {
    findVaultStationPublicKey,
    removeStationPublicKeyFromVault,
    saveStationPublicKeyToVault
} from "../../../../domains/vault/station/api";
import {ensureHarborProject, dropHarborProject, findHarborProject} from "../../../../domains/harbor/project/api";
import {
    dropHarborProjectRobotAccount,
    ensureHarborProjectRobotAccount, findHarborProjectRobotAccount
} from "../../../../domains/harbor/project/robot-account/api";
import {
    dropHarborProjectWebHook,
    ensureHarborProjectWebHook,
    findHarborProjectWebHook
} from "../../../../domains/harbor/project/web-hook/api";

export async function doStationTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn([
            'checkHarbor',

            'ensureHarborProject',
            'dropHarborProject',

            'ensureHarborProjectWebHook',
            'dropHarborProjectWebHook',

            'ensureHarborProjectAccount',
            'dropHarborProjectAccount',

            'checkVault',

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
        case 'checkHarbor':
            try {
                const project = await findHarborProject(entity);

                if(typeof project === 'undefined') {
                    return res._respondAccepted({data: entity});
                }

                entity.harbor_project_id = project.id;

                const webhook = await findHarborProjectWebHook(entity.harbor_project_id);

                if(typeof webhook !== 'undefined') {
                    entity.harbor_project_webhook_exists = true;
                } else {
                    entity.harbor_project_webhook_exists = false;
                }

                if(!entity.harbor_project_account_token) {
                    const robotAccount = await findHarborProjectRobotAccount(entity.harbor_project_id, entity.harbor_project_account_name);

                    if(typeof robotAccount !== 'undefined') {
                        entity.harbor_project_account_name = robotAccount.name;
                    } else {
                        entity.harbor_project_account_name = null;
                    }

                }

                await repository.save(entity);

                return res._respondAccepted({data: entity});
            } catch (e) {
                console.log(e);
                return res._failBadRequest({message: e.message});
            }
        case 'ensureHarborProject':
            try {
                const projectId : number = await ensureHarborProject(entity);

                entity.harbor_project_id = projectId;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'dropHarborProject':
            try {
                await dropHarborProject(entity);

                entity.harbor_project_id = null;

                await repository.save(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }

        case 'ensureHarborProjectWebHook':
            try {
                 await ensureHarborProjectWebHook(entity);

                entity.harbor_project_webhook_exists = true;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'dropHarborProjectWebHook':
            try {
                if(entity.harbor_project_id) {
                    await dropHarborProjectWebHook(entity.harbor_project_id);
                }

                entity.harbor_project_webhook_exists = false;

                await repository.save(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }

        case 'ensureHarborProjectAccount':
            try {
                const { token, name } = await ensureHarborProjectRobotAccount(entity);

                entity.harbor_project_account_name = name;
                entity.harbor_project_account_token = token;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                console.log(e);
                return res._failBadRequest({message: e.message});
            }
        case 'dropHarborProjectAccount':
            try {
                if(entity.harbor_project_id) {
                    await dropHarborProjectRobotAccount(entity);
                }

                entity.harbor_project_account_name = null;
                entity.harbor_project_account_token = null;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }

        case 'checkVault':
            try {
                const publicKey = await findVaultStationPublicKey(entity.id);

                console.log(publicKey);
                console.log(entity.public_key);

                if(typeof publicKey !== 'undefined') {
                    const { content }  = publicKey;

                    entity.vault_public_key_saved = true;
                    entity.public_key = content;
                }

                await repository.save(entity);

                return res._respondAccepted({data: entity});
            } catch (e) {
                console.log(e);
                console.log(e.response.data.errors);
                return res._failBadRequest({message: e.message});
            }
            break;
        case 'saveVaultPublicKey':
            try {
                await saveStationPublicKeyToVault(entity);

                entity.vault_public_key_saved = true;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case 'dropVaultPublicKey':
            try {
                await removeStationPublicKeyFromVault(entity);

                entity.vault_public_key_saved = false;

                await repository.save(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        default:
            return res._failBadRequest({message: 'The task type is not valid...'})
    }
}
