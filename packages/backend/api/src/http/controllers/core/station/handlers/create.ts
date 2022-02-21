/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    isHex,
} from '@personalhealthtrain/ui-common';
import { ForbiddenError } from '@typescript-error/http';
import { validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { ExpressValidationError } from '../../../../express-validation';
import { runStationValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { buildSecretStorageQueueMessage } from '../../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/special/secret-storage/constants';
import env from '../../../../../env';
import { saveStationToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/station';
import {
    saveStationToRegistry,
} from '../../../../../components/registry/handlers/entities/station';
import { RegistryQueueCommand, RegistryQueueEntityType } from '../../../../../domains/special/registry/constants';
import { buildRegistryQueueMessage } from '../../../../../domains/special/registry/queue';

export async function createStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.STATION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = await runStationValidation(req, 'create');

    if (
        data.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
    }

    const repository = getRepository(StationEntity);

    const entity = repository.create(data);

    await repository.save(entity);

    if (entity.public_key) {
        if (env.env === 'test') {
            await saveStationToSecretStorage({
                type: SecretStorageQueueEntityType.STATION,
                id: entity.id,
            });
        } else {
            const queueMessage = buildSecretStorageQueueMessage(
                SecretStorageQueueCommand.SAVE,
                {
                    type: SecretStorageQueueEntityType.STATION,
                    id: entity.id,
                },
            );
            await publishMessage(queueMessage);
        }
    }

    if (env.env === 'test') {
        await saveStationToRegistry({
            type: RegistryQueueEntityType.STATION,
            id: entity.id,
        });
    } else {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.SAVE,
            {
                type: RegistryQueueEntityType.STATION,
                id: entity.id,
            },
        );
        await publishMessage(queueMessage);
    }

    return res.respond({ data: entity });
}
