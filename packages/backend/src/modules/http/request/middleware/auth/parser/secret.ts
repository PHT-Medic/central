import {getRepository} from "typeorm";
import {AuthClient, AuthClientType} from "../../../../../../domains/client";
import {AuthorizationParserResult} from "./index";

export async function parseAuthorizationSecret(secret: string) : Promise<AuthorizationParserResult> {
    const repository = getRepository(AuthClient);

    const entity = await repository.findOne({
        secret
    }, {relations: ['user', 'user.realm', 'service', 'service.realm']});

    if(typeof entity === 'undefined') {
        throw new AuthClientNotFoundError();
    }

    switch (entity.type) {
        case AuthClientType.SERVICE:
            return {
                type: 'service',
                entity: entity.service
            }
        case AuthClientType.USER:
            return {
                type: 'user',
                entity: entity.user
            }
    }

    throw new AuthClientError('The authentication client is not associated to a service or a user.');
}

export class AuthClientError extends Error {

}

export class AuthClientNotFoundError extends AuthClientError {
    constructor() {
        super('The authentication client could not be found.');
    }
}
