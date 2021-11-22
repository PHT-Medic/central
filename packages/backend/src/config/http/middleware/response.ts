/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ExpressNextFunction, ExpressRequest, ExpressResponse} from "../type";

export type RespondMessage = {
    statusMessage?: string,
    statusCode?: number,
    data?: any
};

export default function responseMiddleware(
    request: ExpressRequest,
    response: ExpressResponse,
    next: ExpressNextFunction
) {
    response.respond = (message?: RespondMessage) => {
        if(message) {
            if (message.data == null && message.statusCode == null) {
                message.statusCode = 204;
            } else {
                message.statusCode = message.statusCode == null ? 200 : message.statusCode;
            }

            if (message.data !== null) response.json(message.data);
        } else {
            message = {
                statusCode: 204
            }
        }

        response.status(message.statusCode);

        return response.end();
    };

    // --------------------------------------------------------------------

    response.respondDeleted = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 200,
            message: 'Deleted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response.respond(message);
    };

    response.respondCreated = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 201,
            message: 'Created',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response.respond(message);
    };

    response.respondAccepted = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 202,
            message: 'Accepted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response.respond(message);
    };

    next();
}
