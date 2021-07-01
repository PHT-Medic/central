import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {Station} from "../../../../domains/station";
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
import {BaseService, Service} from "../../../../domains/service";
import {isRealmPermittedForResource} from "../../../../domains/realm/db/utils";

export enum StationTask {
    CHECK_HARBOR = 'checkHarbor',

    ENSURE_HARBOR_PROJECT = 'ensureHarborProject',
    DROP_HARBOR_PROJECT = 'dropHarborProject',

    ENSURE_HARBOR_PROJECT_WEBHOOK = 'ensureHarborProjectWebHook',
    DROP_HARBOR_PROJECT_WEBHOOK = 'dropHarborProjectWebHook',

    ENSURE_HARBOR_PROJECT_ACCOUNT = 'ensureHarborProjectAccount',
    DROP_HARBOR_PROJECT_ACCOUNT = 'dropHarborProjectAccount',

    CHECK_VAULT = 'checkVault',

    SAVE_VAULT_PUBLIC_KEY = 'saveVaultPublicKey',
    DROP_VAULT_PUBLIC_KEY = 'dropVaultPublicKey'
}

export async function doStationTaskRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('edit', 'station')) {
        return res._failBadRequest();
    }

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(Object.values(StationTask))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Station);

    const query = repository.createQueryBuilder('station');

    const addSelection : string[] = [
        'public_key',
        'harbor_project_account_name',
        'harbor_project_account_token',
        'harbor_project_id',
        'harbor_project_webhook_exists',
        'vault_public_key_saved'
    ];

    addSelection.map(selection => query.addSelect('station.'+selection));

    query.where('id = :id', {id});

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    if(!req.ability.can('edit', 'station')) {
        return res._failForbidden();
    }

    switch (validationData.task) {
        case StationTask.CHECK_HARBOR:
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
                    const robotAccount = await findHarborProjectRobotAccount(entity.id);

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
        case StationTask.ENSURE_HARBOR_PROJECT:
            try {
                const projectId : number = await ensureHarborProject(entity);

                entity.harbor_project_id = projectId;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case StationTask.DROP_HARBOR_PROJECT:
            try {
                await dropHarborProject(entity);

                entity.harbor_project_id = null;

                await repository.save(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }

        case StationTask.ENSURE_HARBOR_PROJECT_WEBHOOK:
            try {
                const serviceRepository = getRepository(Service);
                const serviceEntity = await serviceRepository.findOne(BaseService.HARBOR, {relations: ['client']});

                if(typeof serviceEntity.client.secret !== 'string') {
                    return res._failBadRequest({message: 'No client credentials are available for harbor yet. Please generate it first.'});
                }

                await ensureHarborProjectWebHook(entity, serviceEntity.client.secret);

                entity.harbor_project_webhook_exists = true;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case StationTask.DROP_HARBOR_PROJECT_WEBHOOK:
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

        case StationTask.ENSURE_HARBOR_PROJECT_ACCOUNT:
            try {
                const { secret, name } = await ensureHarborProjectRobotAccount(entity.id);

                entity.harbor_project_account_name = name;
                entity.harbor_project_account_token = secret;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                console.log(e);
                return res._failBadRequest({message: e.message});
            }
        case StationTask.DROP_HARBOR_PROJECT_ACCOUNT:
            try {
                if(entity.harbor_project_id) {
                    await dropHarborProjectRobotAccount(entity.id);
                }

                entity.harbor_project_account_name = null;
                entity.harbor_project_account_token = null;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }

        case StationTask.CHECK_VAULT:
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
                return res._failBadRequest({message: e.message});
            }
        case StationTask.SAVE_VAULT_PUBLIC_KEY:
            try {
                await saveStationPublicKeyToVault(entity);

                entity.vault_public_key_saved = true;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case StationTask.DROP_VAULT_PUBLIC_KEY:
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
