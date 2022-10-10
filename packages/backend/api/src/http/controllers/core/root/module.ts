/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Controller, Get, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { checkIntegrityRouteHandler } from './handlers';

@SwaggerTags('base')
@Controller('/')
export class RootController {
    @Get('integrity')
    async integrity(
        @Request() req: any,
            @Response() res: any,
    ) : Promise<void> {
        return checkIntegrityRouteHandler(req, res);
    }
}
