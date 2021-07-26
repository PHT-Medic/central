import {check, matchedData, validationResult} from 'express-validator';
import {getRepository, In} from 'typeorm';
import {HARBOR_MASTER_IMAGE_PROJECT_NAME} from "../../../../config/services/harbor";
import {Client} from "../../../../domains/auth/client";
import {BaseService} from "../../../../domains/service";

import {getHarborProjectRepositories} from "../../../../domains/service/harbor/project/repository/api";
import {MasterImage} from "../../../../domains/pht/master-image";
import {ensureHarborProjectWebHook} from "../../../../domains/service/harbor/project/web-hook/api";

enum HarborTask {
    REGISTER_WEBHOOK_FOR_MASTER_IMAGES = 'registerWebhookForMasterImages',
    SYNC_MASTER_IMAGES = 'syncMasterImages'
}

export async function doHarborTask(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage the harbor service.'});
    }

    await check('task')
        .exists()
        .isIn(Object.values(HarborTask))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    switch (validationData.task) {
        case HarborTask.REGISTER_WEBHOOK_FOR_MASTER_IMAGES:
            const clientRepository = await getRepository(Client);

            const client = await clientRepository.findOne({
                where: {
                    service_id: BaseService.HARBOR
                }
            });

            await ensureHarborProjectWebHook(HARBOR_MASTER_IMAGE_PROJECT_NAME, client, true);

            return res._respondAccepted();
        case HarborTask.SYNC_MASTER_IMAGES:
            const meta : { created: number, deleted: number } = {
                created: 0,
                deleted: 0
            };

            const repository = getRepository(MasterImage);

            const harborRepositories = await getHarborProjectRepositories(HARBOR_MASTER_IMAGE_PROJECT_NAME);
            const harborRepositoryPaths : string[] = harborRepositories.map(harborRepository => harborRepository.fullName);

            const existingEntities = await repository.find({
                where: {
                    path: In(harborRepositoryPaths)
                }
            });

            const existingEntityPaths : string[] = existingEntities.map(entity => entity.path);

            const nonExistingHarborRepositories = harborRepositories.filter(harborRepository => !existingEntityPaths.includes(harborRepository.fullName));
            if(nonExistingHarborRepositories.length === 0) {
                return res._respond({
                    data: {
                        meta
                    }
                });
            }

            const entities : MasterImage[] = nonExistingHarborRepositories.map(harborRepository => {
                return repository.create({
                    path: harborRepository.fullName,
                    name: harborRepository.name
                }) as MasterImage;
            });

            await repository.insert(entities);

            meta.created = entities.length;

            return res._respond({
                data: {
                    created: entities,
                    meta
                }
            });
    }
}
