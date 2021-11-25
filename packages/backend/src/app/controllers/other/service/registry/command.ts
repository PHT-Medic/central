/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { In, getRepository } from 'typeorm';
import {
    Client, MasterImage,
    PermissionID,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME, RegistryCommand, SERVICE_ID,
    Station, buildRegistryHarborProjectName, deleteHarborProject, dropHarborProjectAccount,
    dropHarborProjectWebHook, ensureHarborProject,
    ensureHarborProjectRobotAccount,
    ensureHarborProjectWebHook,
    findHarborRobotAccount,
    getHarborProjectRepositories,
    getRegistryStationProjectNameId, isRegistryStationProjectName, isSpecialRegistryProjectName, pullProject,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import env from '../../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../../config/http/type';
import { ExpressValidationError } from '../../../../../config/http/error/validation';

const commands = Object.values(RegistryCommand);

export async function doRegistryCommand(req: ExpressRequest, res: ExpressResponse) {
    if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry service.');
    }

    const { command } = req.body;

    if (
        !command
        || commands.indexOf(command) === -1
    ) {
        throw new BadRequestError('The harbor command is not valid.');
    }

    await check('name')
        .exists()
        .isString()
        .custom((value) => isSpecialRegistryProjectName(value) || isRegistryStationProjectName(value))
        .run(req);

    const createValidation = validationResult(req);
    if (!createValidation.isEmpty()) {
        throw new ExpressValidationError(createValidation);
    }

    const createData = matchedData(req, { includeOptionals: true });

    let projectName : string = createData.name;

    const stationRepository = getRepository(Station);
    let station : Station | undefined;
    if (isRegistryStationProjectName(projectName)) {
        const stationId : string = getRegistryStationProjectNameId(projectName);

        const query = stationRepository.createQueryBuilder('station');

        const addSelection : string[] = [
            'secure_id',
            'public_key',
            'registry_project_account_name',
            'registry_project_account_token',
            'registry_project_id',
            'registry_project_webhook_exists',
        ];

        addSelection.map((selection) => query.addSelect(`station.${selection}`));

        query.where('id = :id', { id: stationId });

        station = await query.getOne();
        if (typeof station === 'undefined') {
            throw new NotFoundError();
        }

        projectName = buildRegistryHarborProjectName(station.secure_id);
    }

    switch (command as RegistryCommand) {
        // Project
        case RegistryCommand.PROJECT_PULL:
            const project = await pullProject(projectName, true);

            if (typeof project === 'undefined') {
                throw new NotFoundError();
            }

            if (
                typeof station !== 'undefined'
            ) {
                station = stationRepository.merge(station, {
                    registry_project_id: project.id,
                    registry_project_webhook_exists: !!project.webhook,
                });

                if (typeof project.robot_account !== 'undefined') {
                    station = stationRepository.merge(station, {
                        registry_project_account_name: project.robot_account.name,
                        registry_project_account_token: project.robot_account.secret,
                    });
                }

                await stationRepository.save(station);
            }

            return res.respond({ data: project });
        case RegistryCommand.PROJECT_CREATE:
            const entity = await ensureHarborProject(projectName);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_id: entity.id,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: entity });
        case RegistryCommand.PROJECT_DROP:
            await deleteHarborProject(projectName, true);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_id: null,
                    registry_project_webhook_exists: false,
                    registry_project_account_name: null,
                    registry_project_account_token: null,
                });

                await stationRepository.save(station);
            }

            return res.respondDeleted();

            // Repositories
        case RegistryCommand.PROJECT_REPOSITORIES_SYNC:
            const meta : { created: number, deleted: number } = {
                created: 0,
                deleted: 0,
            };

            const harborRepositories = await getHarborProjectRepositories(projectName);
            const harborRepositoryPaths : string[] = harborRepositories.map((harborRepository) => harborRepository.fullName);

            let data : unknown[] = [];

            switch (projectName) {
                case REGISTRY_MASTER_IMAGE_PROJECT_NAME:
                    const repository = getRepository(MasterImage);
                    const existingEntities = await repository.find({
                        where: {
                            path: In(harborRepositoryPaths),
                        },
                    });

                    const existingEntityPaths : string[] = existingEntities.map((entity) => entity.path);

                    const nonExistingHarborRepositories = harborRepositories.filter((harborRepository) => !existingEntityPaths.includes(harborRepository.fullName));
                    if (nonExistingHarborRepositories.length === 0) {
                        return res.respond({
                            data: {
                                meta,
                            },
                        });
                    }

                    const entities : MasterImage[] = nonExistingHarborRepositories.map((harborRepository) => repository.create({
                        path: harborRepository.fullName,
                        name: harborRepository.name,
                    }) as MasterImage);

                    await repository.insert(entities);

                    meta.created = entities.length;

                    data = entities;
                    break;
            }

            return res.respond({
                data: {
                    data: [...data],
                    meta,
                },
            });

            // Robot Account
        case RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE:
            const robotAccount = await ensureHarborProjectRobotAccount(projectName, projectName);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_account_name: robotAccount.name,
                    registry_project_account_token: robotAccount.secret,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: robotAccount });
        case RegistryCommand.PROJECT_ROBOT_ACCOUNT_DROP:
            const { id } = await findHarborRobotAccount(projectName, false);
            if (id) {
                await dropHarborProjectAccount(id);
            }

            return res.respondDeleted();

            // Webhook
        case RegistryCommand.PROJECT_WEBHOOK_CREATE:
            const clientRepository = await getRepository(Client);

            const client = await clientRepository.findOne({
                where: {
                    service_id: SERVICE_ID.REGISTRY,
                },
            });

            const webhook = await ensureHarborProjectWebHook(projectName, client, {
                internalAPIUrl: env.internalApiUrl,
            }, true);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_webhook_exists: true,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: webhook });

        case RegistryCommand.PROJECT_WEBHOOK_DROP:
            await dropHarborProjectWebHook(projectName, true);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_webhook_exists: false,
                });

                await stationRepository.save(station);
            }

            return res.respondDeleted();
    }
}
