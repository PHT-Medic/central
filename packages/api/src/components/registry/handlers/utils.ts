/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot } from '@authup/core';
import { stringifyAuthorizationHeader } from 'hapic';
import type { Client, ProjectWebhookTarget } from '@hapic/harbor';
import { createClient } from '@hapic/harbor';
import { ServiceID } from '@personalhealthtrain/central-common';

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

export function createBasicHarborAPIClient(connectionString: string) : Client {
    // todo: use proxy config in the future...
    return createClient({
        driver: {
            proxy: false,
        },
        extra: {
            connectionString,
        },
    });
}
