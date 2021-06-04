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

/*
declare namespace Express {
    export interface Response {
        status: any,
        json: any,
        end: any,
        _respond: any,
        _respondException: any,
        _respondDeleted: any,
        _respondCreated: any,
        _respondAccepted: any,

        _fail: any,
        _failValidationError: any,
        _failExpressValidationError: any,
        _failUnauthorized: any,
        _failForbidden: any,
        _failNotFound: any,
        _failServerError: any
    }

    export interface Request {

    }
}
 */

export default function responseMiddleware(request: any, response: any, next: any) {
    let defaultErrorCode = 'service_error';
    let defaultErrorMessage = 'Der Dienst ist in einen unerwarteten Zustand geraten, welcher ihn daran gehindert hat die Anfrage zu bearbeiten.';

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

        let data: object = {
            error: {
                message: message.message,
                code: message.code
            }
        };

        response.json(data);

        return response.end();
    };

    //--------------------------------------------------------------------

    response._respondDeleted = (message?: RespondMessage) => {
        let defaultMessage = {
            statusCode: 200,
            message: 'Deleted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    response._respondCreated = (message?: RespondMessage) => {
        let defaultMessage = {
            statusCode: 201,
            message: 'Created',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    response._respondAccepted = (message?: RespondMessage) => {
        let defaultMessage = {
            statusCode: 202,
            message: 'Accepted',
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respond(message);
    };

    //--------------------------------------------------------------------

    response._fail = (message?: RespondErrorMessage) => {
        if(message) {
            message.statusCode = message.statusCode ? message.statusCode : 400;
        }

        return response._respondException(message);
    };

    //--------------------------------------------------------------------

    response._failExpressValidationError = (validation: any) => {
        if(validation.isEmpty()) {
            return response._respond();
        }

        let errors = validation.errors;
        let invalidParams: string[] = [];

        for(let i=0; i < errors.length; i++) {
            if(invalidParams.indexOf(errors[i].param) === -1) {
                invalidParams.push(errors[i].param);
            }
        }

        let message: string;

        if(invalidParams) {
            if(invalidParams.length > 1) {
                message = 'Die Parameter ' + invalidParams.join(', ') + ' sind nicht gültig.';
            } else {
                message = 'Der Parameter ' + invalidParams[0] + ' ist nicht gültig.';
            }
        } else {
            message =  'Es ist ein unbekannter Validierungsfehler aufgetreten.';
        }

        let result: RespondErrorMessage = {};
        result.message = message;
        result.statusCode = 400;
        result.code = 'invalid_request';

        return response._respondException(result);
    };

    response._failUnauthorized = (message?: RespondErrorMessage) => {
        let defaultMessage = {
            statusCode: 401,
            message: 'Unauhtorized',
            code: 'unauhthorized'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failForbidden = (message?: RespondErrorMessage) => {
        let defaultMessage = {
            statusCode: 403,
            message: 'Forbidden',
            code: 'forbidden'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failNotFound = (message?: RespondErrorMessage) => {
        let defaultMessage = {
            statusCode: 404,
            message: 'Not Found',
            code: 'not-found'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failBadRequest = (message?: RespondErrorMessage) => {
        let defaultMessage = {
            statusCode: 400,
            message: 'Bad Request',
            code: 'bad-request'
        }

        message = message || {};
        message = Object.assign(defaultMessage, message);

        return response._respondException(message);
    };

    response._failValidationError = (message?: RespondErrorMessage) => {
        let defaultMessage = {
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
