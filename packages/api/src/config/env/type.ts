/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from './constants';

export interface Environment {
    env: `${EnvironmentName}`,
    port: number,

    jwtMaxAge: number,

    minioConnectionString: string,
    redisConnectionString: string,
    rabbitMqConnectionString: string,
    vaultConnectionString: string,

    apiUrl: string,
    authApiUrl: string,
    appUrl: string,

    skipProposalApprovalOperation: boolean,
    skipTrainApprovalOperation: boolean,

    httpProxyAPIs: string | undefined,
}
