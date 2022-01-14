/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import {
    HarborAPI,
    PermissionID, RegistryCommand,
    ServiceID,
    Station, isSpecialRegistryProjectName,
} from '@personalhealthtrain/ui-common';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { RobotEntity } from '@typescript-auth/server';
import {
    buildRegistryStationProjectName,
    getRegistryStationProjectNameId, isRegistryStationProjectName,
} from '@personalhealthtrain/ui-common/src/domains/core/station/registry';
import { useTrapiClient } from '@trapi/client';
import env from '../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ApiKey } from '../../../../config/api';

const commands = Object.values(RegistryCommand);

export async function doRegistryCommand(req: ExpressRequest, res: ExpressResponse) {
    if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry service.');
    }

    const { command } = req.body;

    if (
        !command ||
        commands.indexOf(command) === -1
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

    const stationRepository = getRepository<Station>(StationEntity);
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

        projectName = buildRegistryStationProjectName(station.secure_id);
    }

    switch (command as RegistryCommand) {
        // Project
        case RegistryCommand.PROJECT_PULL: {
            const project = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).project.find(projectName, true);

            if (typeof project === 'undefined') {
                throw new NotFoundError();
            }

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_id: project.id,
                });

                const webhook = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.find(projectName, true);
                if (webhook) {
                    station = stationRepository.merge(station, {
                        registry_project_webhook_exists: !!webhook,
                    });
                }

                const robotAccount = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).robotAccount.find(projectName, true);
                if (robotAccount) {
                    station = stationRepository.merge(station, {
                        registry_project_account_name: robotAccount.name,
                        registry_project_account_token: robotAccount.secret,
                    });
                }

                await stationRepository.save(station);
            }

            return res.respond({ data: project });
        }
        case RegistryCommand.PROJECT_CREATE: {
            const entity = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).project.save({
                project_name: projectName,
                public: !station,
            });

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_id: entity.id,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: entity });
        }
        case RegistryCommand.PROJECT_DROP: {
            await useTrapiClient<HarborAPI>(ApiKey.HARBOR).project.delete(projectName, true);

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
        }
        // Repositories
        case RegistryCommand.PROJECT_REPOSITORIES_SYNC: {
            throw new NotImplementedError();
        }
        // Robot Account
        case RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE: {
            const robotAccount = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).robotAccount.ensure(projectName, projectName);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_account_name: robotAccount.name,
                    registry_project_account_token: robotAccount.secret,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: robotAccount });
        }
        case RegistryCommand.PROJECT_ROBOT_ACCOUNT_DROP: {
            const { id } = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).robotAccount.find(projectName, false);
            if (id) {
                await useTrapiClient<HarborAPI>(ApiKey.HARBOR).robotAccount.delete(id);
            }

            return res.respondDeleted();
        }
        // Webhook
        case RegistryCommand.PROJECT_WEBHOOK_CREATE: {
            const clientRepository = await getRepository(RobotEntity);

            const robot = await clientRepository.findOne({
                where: {
                    name: ServiceID.REGISTRY,
                },
            });

            const webhook = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(projectName, robot, {
                internalAPIUrl: env.internalApiUrl,
            }, true);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_webhook_exists: true,
                });

                await stationRepository.save(station);
            }

            return res.respondCreated({ data: webhook });
        }
        case RegistryCommand.PROJECT_WEBHOOK_DROP: {
            await useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.delete(projectName, true);

            if (typeof station !== 'undefined') {
                station = stationRepository.merge(station, {
                    registry_project_webhook_exists: false,
                });

                await stationRepository.save(station);
            }

            return res.respondDeleted();
        }
    }

    throw new BadRequestError();
}
