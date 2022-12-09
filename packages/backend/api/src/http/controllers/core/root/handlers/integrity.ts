/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MASTER_REALM_ID, createNanoID } from '@authup/common';
import { hash } from '@authup/server-common';
import { RobotRepository, useRobotEventEmitter } from '@authup/server-database';
import { Client as VaultClient } from '@hapic/vault';
import { HTTPClientKey, ROBOT_SECRET_ENGINE_KEY, ServiceID } from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { Request, Response, sendAccepted } from 'routup';
import { useDataSource } from 'typeorm-extension';

export async function checkIntegrityRouteHandler(
    req: Request,
    res: Response,
) : Promise<any> {
    const vaultClient = useClient<VaultClient>(HTTPClientKey.VAULT);

    const response = vaultClient.keyValue.find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);
    if (!response) {
        const secret = createNanoID(64);

        const dataSource = await useDataSource();
        const repository = new RobotRepository(dataSource);
        let entity = await repository.findOneBy({
            name: ServiceID.SYSTEM,
        });

        if (entity) {
            entity.secret = await hash(secret);
        } else {
            entity = repository.create({
                name: ServiceID.SYSTEM,
                realm_id: MASTER_REALM_ID,
                secret: await hash(secret),
            });
        }

        await repository.save(entity);

        useRobotEventEmitter()
            .emit('credentials', {
                ...entity,
                secret,
            });
    }

    return sendAccepted(res);
}
