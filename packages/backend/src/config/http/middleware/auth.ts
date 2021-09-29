/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Middleware} from "@decorators/express";
import {NextFunction, Request, Response} from "express";

export function forceLoggedIn(req: any, res: any, next: any) {
    if (
        typeof req.userId === 'undefined' &&
        typeof req.serviceId === 'undefined'
    ) {
        res._failUnauthorized({message: 'You are not authenticated.'});
        return;
    }

    next();
}

export class ForceLoggedInMiddleware implements Middleware {
    public use(request: Request, response: Response, next: NextFunction) {
        return forceLoggedIn(request, response, next);
    }
}
