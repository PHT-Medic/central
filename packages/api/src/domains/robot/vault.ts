/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    hasClient,
    isClientErrorWithStatusCode,
    useClient,
} from '@hapic/vault';
import type { RobotVaultPayload } from './type';
import { isRobotVaultPayload } from './utils';

export async function findRobotCredentialsInVault(
    name: string,
) : Promise<RobotVaultPayload | undefined> {
    if (!hasClient()) {
        return undefined;
    }

    const client = useClient();

    try {
        const response = await client.keyValueV1.getOne({
            mount: 'robots',
            path: name,
        });

        if (
            response &&
            response.data &&
            isRobotVaultPayload(response.data)
        ) {
            return response.data;
        }

        return undefined;
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            return undefined;
        }

        throw e;
    }
}
