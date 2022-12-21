/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RouteContext } from '../type';
import { useLogger } from '../../../../../modules/log';

export async function routeOutgoingProject(context: RouteContext) : Promise<void> {
    useLogger().debug(`Handle outgoing project ${context.project.name}.`, {
        component: 'routing',
    });
}
