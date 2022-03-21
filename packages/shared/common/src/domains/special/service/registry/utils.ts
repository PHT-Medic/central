/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot } from '@authelion/common';
import { stringifyAuthorizationHeader } from '@trapi/client';
import { HarborProjectWebhookTarget } from '../../../../http';
import { ServiceID } from '../constants';

export function buildRegistryWebhookTarget(
    context: {
        robot: Pick<Robot, 'id' | 'secret'>,
        apiUrl: string
    },
) : HarborProjectWebhookTarget {
    return {
        auth_header: stringifyAuthorizationHeader({
            type: 'Basic',
            username: context.robot.id,
            password: context.robot.secret,
        }),
        skip_cert_verify: true,
        address: `${context.apiUrl}services/${ServiceID.REGISTRY}/hook`,
        type: 'http',
    };
}
