/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RouterCommand } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import type { RouteContext } from '../type';

export async function routeOutgoingProject(context: RouteContext) : Promise<void> {
    useRouterLogger().debug(`Handle outgoing project ${context.project.name}.`, {
        command: RouterCommand.ROUTE,
    });
}
