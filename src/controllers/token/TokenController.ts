//---------------------------------------------------------------------------------

import TokenResponseSchema from "../../domains/token/TokenResponseSchema";

import {createToken} from "../../services/auth/helpers/tokenHelper";
import { KeyCloakProvider } from "../../services/auth/providers/keycloak";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../domains/user/repository";

//---------------------------------------------------------------------------------

const grantToken = async (req: any, res: any) => {
    const {name, password, provider} = req.body;

    let payload : {[key: string] : any};

    try {
        switch (provider) {
            case 'keycloak':
                const keycloakProvider = new KeyCloakProvider();
                const userProviderMapping = await keycloakProvider.loginWithPasswordGrant(name, password);

                payload = {
                    id: userProviderMapping.user_id
                }
                break;
            case 'default':
            default:
                const userRepository = getCustomRepository<UserRepository>(UserRepository);
                const localUser = await userRepository.findByCredentials(name, password);

                payload = {
                    id: localUser.id
                }
                break;
        }
    } catch (e) {
        return res._failValidationError({message: e.message});
    }

    const {
        token,
        expiresIn
    } = await createToken(payload);

    res.cookie('token',token, {
        maxAge: expiresIn
    });

    let ob = {
        token,
        expires_in: expiresIn
    };

    let tokenResponseSchema = new TokenResponseSchema();
    ob = tokenResponseSchema.applySchemaOnEntity(ob);

    return res._respond({
        data: ob
    });
};

//---------------------------------------------------------------------------------

const revokeToken = async (req: any, res: any) => {
    res.cookie('token', null, {maxAge: Date.now()});
    return res._respond();
};

//---------------------------------------------------------------------------------

export default {
    grantToken,
    revokeToken
};
