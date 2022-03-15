import {
    HarborAPI,
    PermissionID,
    STATION_SECRET_ENGINE_KEY,
    VaultAPI,
    buildRegistryStationProjectName,
    isHex,
} from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { useClient } from '@trapi/client';
import { publishMessage } from 'amqp-extension';
import { isPermittedForResourceRealm } from '@authelion/common';
import { runStationValidation } from './utils';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ApiKey } from '../../../../../config/api';
import { buildSecretStorageQueueMessage } from '../../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/special/secret-storage/constants';
import env from '../../../../../env';
import { saveStationToSecretStorage } from '../../../../../components/secret-storage/handlers/entities/station';

export async function updateStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
        throw new ForbiddenError();
    }

    const data = await runStationValidation(req, 'update');
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.registry_project_id',
            'station.registry_project_account_id',
            'station.registry_project_account_name',
            'station.registry_project_account_token',
            'station.registry_project_webhook_exists',
            'station.public_key',
            'station.secure_id',
        ])
        .where('station.id = :id', { id });

    let entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (
        data.public_key &&
        data.public_key !== entity.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
    }

    if (data.secure_id) {
        // secure id changed -> remove vault- & harbor-project
        if (data.secure_id !== entity.secure_id) {
            try {
                const name = buildRegistryStationProjectName(entity.secure_id);
                await useClient<HarborAPI>(ApiKey.HARBOR).project
                    .delete(name, true);
            } catch (e) {
                // ...
            }

            try {
                await useClient<VaultAPI>(ApiKey.VAULT).keyValue
                    .delete(STATION_SECRET_ENGINE_KEY, entity.secure_id);
            } catch (e) {
                // ...
            }
        }
    }

    entity = repository.merge(entity, data);

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

    return res.respondAccepted({
        data: entity,
    });
}
