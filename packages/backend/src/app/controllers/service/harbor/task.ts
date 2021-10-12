/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {check, matchedData, validationResult} from 'express-validator';
import {getRepository, In} from 'typeorm';
import {
    BaseService,
    Client,
    ensureHarborProject,
    ensureHarborProjectWebHook,
    getHarborProjectRepositories,
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME,
    HarborCommand,
    MasterImage
} from "@personalhealthtrain/ui-common";

import env from "../../../../env";

const commands = Object.values(HarborCommand);

export async function doHarborCommand(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not allowed to manage the harbor service.'});
    }

    const {command} = req.body;

    if(
        !command ||
        commands.indexOf(command) === -1
    ) {
        return res._failBadRequest({message: 'The harbor command is not valid.'});
    }

    switch (command as HarborCommand) {
        case HarborCommand.REPOSITORY_CREATE:
            await check('name')
                .exists()
                .isString()
                .isIn([
                    HARBOR_INCOMING_PROJECT_NAME,
                    HARBOR_OUTGOING_PROJECT_NAME,
                    HARBOR_MASTER_IMAGE_PROJECT_NAME
                ])
                .run(req);

            await check('webhook')
                .optional({nullable: true})
                .isBoolean()
                .run(req);

            const createValidation = validationResult(req);
            if (!createValidation.isEmpty()) {
                return res._failExpressValidationError(createValidation);
            }

            const createData = matchedData(req, {includeOptionals: true});

            await ensureHarborProject(createData.name);

            if(!!createData.webhook) {
                const clientRepository = await getRepository(Client);

                const client = await clientRepository.findOne({
                    where: {
                        service_id: BaseService.HARBOR
                    }
                });

                await ensureHarborProjectWebHook(createData.name, client, {
                    internalAPIUrl: env.internalApiUrl
                }, true);
            }

            return res._respond();
        case HarborCommand.REPOSITORY_SYNC:
            await check('name')
                .exists()
                .isString()
                .isIn([
                    HARBOR_MASTER_IMAGE_PROJECT_NAME
                ])
                .run(req);

            const syncValidation = validationResult(req);
            if (!syncValidation.isEmpty()) {
                return res._failExpressValidationError(syncValidation);
            }

            const syncData = matchedData(req, {includeOptionals: true});

            const meta : { created: number, deleted: number } = {
                created: 0,
                deleted: 0
            };

            const harborRepositories = await getHarborProjectRepositories(syncData.name);
            const harborRepositoryPaths : string[] = harborRepositories.map(harborRepository => harborRepository.fullName);

            let data : unknown[] = [];

            switch (syncData.name) {
                case HARBOR_MASTER_IMAGE_PROJECT_NAME:
                    const repository = getRepository(MasterImage);
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

                    data = entities;
                    break;
            }

            return res._respond({
                data: {
                    data: [...data],
                    meta
                }
            });
    }
}
