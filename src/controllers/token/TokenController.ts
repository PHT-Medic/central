//---------------------------------------------------------------------------------

import TokenResponseSchema from "../../domains/token/TokenResponseSchema";
import env from "../../env";
import {createToken} from "../../services/auth/helpers/tokenHelper";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../domains/user/repository";
import {Provider} from "../../domains/provider";
import {Oauth2PasswordProvider} from "../../services/auth/providers";
import {Realm} from "../../domains/realm";

//---------------------------------------------------------------------------------

const grantToken = async (req: any, res: any) => {
    const {name, password, provider} = req.body;

    let payload : {[key: string] : any};

    try {
        if(typeof provider === 'number') {
            const providerRepository = getRepository(Provider);
            const authenticator = await providerRepository.createQueryBuilder('provider')
                .leftJoinAndSelect('provider.realm', 'realm')
                .where("provider.id = :id", {id: provider})
                .andWhere("provider.realm_id = :realmId", {realmId: 'master'})
                .getOne();

            if(typeof authenticator === 'undefined') {
                return res._failValidationError({message: 'Die Konfigurationen für den alternativen lokalen Authenticator wurden nicht gefunden.'});
            }

            const oauth2Provider = new Oauth2PasswordProvider(authenticator);

            try {
                const loginToken = await oauth2Provider.getToken(name, password);
                const userAccount = await oauth2Provider.loginWithToken(loginToken);

                payload = {
                    id: userAccount.user_id
                }
            } catch (e) {
                return res._failValidationError({message: 'Die Zugangsdaten sind nicht gültig oder der lokale Authenticator ist nicht erreichbar.'});
            }
        } else {
            const userRepository = getCustomRepository<UserRepository>(UserRepository);
            const localUser = await userRepository.findByCredentials(name, password);

            if(typeof localUser === 'undefined') {
                return res._failValidationError({message: 'Der Benutzer oder das Passwort ist falsch...'});
            }

            payload = {
                id: localUser.id
            }
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
