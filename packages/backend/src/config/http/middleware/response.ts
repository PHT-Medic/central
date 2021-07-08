type RespondMessage = {
    statusMessage?: string,
    statusCode?: number,
    data?: any
};

type RespondErrorMessage = {
    statusMessage?: string,
    statusCode?: number,
    message?: string,
    code?: string
}

export default function responseMiddleware(request: any, response: any, next: any) {
    const defaultErrorCode = 'service_error';
    const defaultErrorMessage = 'The service encountered an unknown error, which prevented it from fulfilling the request.';

    response._respond = (message?: RespondMessage) => {
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

    response._respondException = (message?: RespondErrorMessage) => {
        if(message) {
            message.code = message.code === undefined ? defaultErrorCode : message.code;
            message.message = message.message === undefined ? defaultErrorMessage : message.message;

            message.statusCode = message.statusCode === undefined ? 500 : message.statusCode;
        } else {
            message = {
                code: defaultErrorCode,
                message: defaultErrorMessage,
                statusCode: 500
            }
        }

        response.status(message.statusCode);

        const data: object = {
            message: message.message,
            code: message.code
        };

        response.json(data);

        return response.end();
    };

    // --------------------------------------------------------------------

    response._respondDeleted = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 200,
            message: 'Deleted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    response._respondCreated = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 201,
            message: 'Created',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    response._respondAccepted = (message?: RespondMessage) => {
        const defaultMessage = {
            statusCode: 202,
            message: 'Accepted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    // --------------------------------------------------------------------

    response._fail = (message?: RespondErrorMessage) => {
        if(message) {
            message.statusCode = message.statusCode ? message.statusCode : 400;
        }

        return response._respondException(message);
    };

    // --------------------------------------------------------------------

    response._failExpressValidationError = (validation: any) => {
        if(validation.isEmpty()) {
            return response._respond();
        }

        const errors = validation.errors;
        const invalidParams: string[] = [];

        for(let i=0; i < errors.length; i++) {
            if(invalidParams.indexOf(errors[i].param) === -1) {
                invalidParams.push(errors[i].param);
            }
        }

        let message: string;

        if(invalidParams) {
            if(invalidParams.length > 1) {
                message = 'The parameters ' + invalidParams.join(', ') + ' are not valid.';
            } else {
                message = 'The parameter ' + invalidParams[0] + ' is not valid.';
            }
        } else {
            message =  'An unknown validation error occurred.';
        }

        const result: RespondErrorMessage = {};
        result.message = message;
        result.statusCode = 400;
        result.code = 'invalid_request';

        return response._respondException(result);
    };

    response._failUnauthorized = (message?: RespondErrorMessage) => {
        const defaultMessage = {
            statusCode: 401,
            message: 'Unauhtorized',
            code: 'unauhthorized'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failForbidden = (message?: RespondErrorMessage) => {
        const defaultMessage = {
            statusCode: 403,
            message: 'Forbidden',
            code: 'forbidden'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failNotFound = (message?: RespondErrorMessage) => {
        const defaultMessage = {
            statusCode: 404,
            message: 'Not Found',
            code: 'not-found'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failBadRequest = (message?: RespondErrorMessage) => {
        const defaultMessage = {
            statusCode: 400,
            message: 'Bad Request',
            code: 'bad-request'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failValidationError = (message?: RespondErrorMessage) => {
        const defaultMessage = {
            statusCode: 400,
            message: 'Bad Request',
            code: 'bad-request'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failServerError = (message?: RespondErrorMessage) => {
        if(message) {
            message.statusCode = 500;
            message.message = message.message ? message.message : 'Internal Server Error';
            message.code = message.code ? message.code : 'server-error';
        }

        return response._respondException(message);
    };

    next();
}
