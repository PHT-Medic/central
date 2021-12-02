/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SwaggerTags } from 'typescript-swagger';
import {
    Controller, Get, Request, Response,
} from '@decorators/express';
import { register } from 'prom-client';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';

@SwaggerTags('extra')
@Controller('/metrics')
export class MetricsController {
    @Get('', [ForceLoggedInMiddleware])
    async handleHarborHook(
    @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
    ) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        const data = await register.metrics();
        return res.end(data);
    }
}
