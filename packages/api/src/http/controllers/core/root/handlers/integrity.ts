/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '@authup/common';
import { hash } from '@authup/server-common';
import {
    RealmRepository, RobotRepository, useRobotEventEmitter,
} from '@authup/server-database';
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

        const realmRepository = new RealmRepository(dataSource);
        const realm = await realmRepository.getMaster();

        const robotRepository = new RobotRepository(dataSource);
        let robotEntity = await robotRepository.findOneBy({
            name: ServiceID.SYSTEM,
        });

        if (robotEntity) {
            robotEntity.secret = await hash(secret);
        } else {
            robotEntity = robotRepository.create({
                name: ServiceID.SYSTEM,
                realm_id: realm.id,
                secret: await hash(secret),
            });
        }

        await robotRepository.save(robotEntity);

        useRobotEventEmitter()
            .emit('credentials', {
                ...robotEntity,
                secret,
            });
    }

    return sendAccepted(res);
}
