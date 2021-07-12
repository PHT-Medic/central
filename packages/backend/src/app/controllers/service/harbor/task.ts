import {check, matchedData, validationResult} from 'express-validator';
import {getRepository, In} from 'typeorm';
import {HARBOR_MASTER_IMAGE_PROJECT_NAME} from "../../../../config/services/harbor";

import {getHarborProjectRepositories} from "../../../../domains/service/harbor/project/repository/api";
import {MasterImage} from "../../../../domains/pht/master-image";

enum HarborTask {
    syncMasterImages = 'syncMasterImages'
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
        case HarborTask.syncMasterImages:
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
                return res._respondAccepted();
            }

            const entities : MasterImage[] = nonExistingHarborRepositories.map(harborRepository => {
                return repository.create({
                    path: harborRepository.fullName,
                    name: harborRepository.name
                }) as MasterImage;
            });

            await repository.insert(entities);

            return res._respondAccepted();
    }
}
