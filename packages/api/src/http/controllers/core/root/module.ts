/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DController, DGet, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { checkIntegrityRouteHandler } from './handlers';

@DTags('base')
@DController('')
export class RootController {
    @DGet('/integrity')
    async integrity(
        @DRequest() req: any,
            @DResponse() res: any,
    ) : Promise<void> {
        return checkIntegrityRouteHandler(req, res);
    }
}
