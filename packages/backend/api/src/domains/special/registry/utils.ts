/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot } from '@authelion/common';
import { Config, stringifyAuthorizationHeader } from '@trapi/client';
import { HarborClient, ProjectWebhookTarget } from '@trapi/harbor-client';
import { ServiceID, detectProxyConnectionConfig } from '@personalhealthtrain/central-common';

export function buildRegistryWebhookTarget(
    context: {
        robot: Pick<Robot, 'id' | 'secret'>,
        url: string
    },
) : ProjectWebhookTarget {
    return {
        auth_header: stringifyAuthorizationHeader({
            type: 'Basic',
            username: context.robot.id,
            password: context.robot.secret,
        }),
        skip_cert_verify: true,
        address: `${context.url}services/${ServiceID.REGISTRY}/hook`,
        type: 'http',
    };
}

export function createBasicHarborAPIConfig(connectionString: string) : Config {
    const proxyConfig = detectProxyConnectionConfig();

    return {
        clazz: HarborClient,
        driver: {
            ...(proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
        },
        extra: {
            connectionString,
        },
    };
}
