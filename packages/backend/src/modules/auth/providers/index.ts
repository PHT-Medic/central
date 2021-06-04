import {Provider} from "../../../domains/provider";
import axios from "axios";
import {getExpirationDate} from "../index";
import {decode} from "jsonwebtoken";
import {UserAccount} from "../../../domains/user/account";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../domains/user/repository";
import {buildQuery} from "../../api/utils";
import env from "../../../env";
import {Role} from "../../../domains/role";

export type LoginToken = {
    accessToken: string,
    accessTokenPayload: {[key: string] : any}
    refreshToken: string,
    expiresIn: string,
    roles?: string[],
    userName: string,
    [key: string] : any
}

export class Oauth2Provider {
    constructor(protected provider: Provider) {

    }

    async loginWithToken(loginToken: LoginToken) : Promise<UserAccount> {
        const userRepository = getCustomRepository(UserRepository);
        const userAccountRepository = getRepository(UserAccount);

        let userAccount = await userAccountRepository.findOne({
            provider_user_id: loginToken.accessTokenPayload.sub,
            provider_id: this.provider.id
        }, {relations: ['user']});

        if(typeof userAccount !== 'undefined') {
            userAccount = userAccountRepository.merge(userAccount, {
                access_token: loginToken.accessToken,
                refresh_token: loginToken.refreshToken,
                expires_in: loginToken.expiresIn
            });

            await userAccountRepository.save(userAccount);
        } else {
            let user = userRepository.create({
                name: loginToken.userName,
                realm_id: this.provider.realm_id
            });

            await userRepository.save(user);

            userAccount = userAccountRepository.create({
                provider_id: this.provider.id,
                provider_user_id: loginToken.accessTokenPayload.sub,
                provider_user_name: loginToken.userName,
                access_token: loginToken.accessToken,
                refresh_token: loginToken.refreshToken,
                expires_in: loginToken.expiresIn,
                user: user
            });

            await userAccountRepository.save(userAccount);
        }

        if(typeof loginToken.roles !== 'undefined') {
            const roles: Role[] = await getRepository(Role)
                .createQueryBuilder('role')
                .where("role.provider_role_id in (:...id)", {id: loginToken.roles})
                .getMany();

            await userRepository.syncRoles(userAccount.user_id, roles);
        }

        return userAccount;
    }

    async tokenRequest(parameter: {[key: string] : any}) : Promise<LoginToken> {
        const urlSearchParams = new URLSearchParams();
        for(let key in parameter) {
            urlSearchParams.append(key, parameter[key]);
        }

        try {
            const response = await axios.post(
                this.provider.token_host + (this.provider.token_path ? this.provider.token_path : '/oauth/token'),
                urlSearchParams,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            let loginToken : Partial<LoginToken> = {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: getExpirationDate(response.data.expires_in).toISOString(),
            }

            const tokenPayload = decode(loginToken.accessToken);
            if(typeof tokenPayload === 'string') {
                throw new Error('Der Token des Authenticators konnte nicht gelesen werden.');
            }

            loginToken.accessTokenPayload = tokenPayload;
            loginToken.userName = tokenPayload.preferred_username ?? parameter.username ?? this.provider.id+':'+tokenPayload.sub;

            if(typeof tokenPayload?.realm_access?.roles !== 'undefined') {
                loginToken.roles = tokenPayload.realm_access.roles;
            }

            return <LoginToken> loginToken;
        } catch (e) {
            console.log(e);
            throw new Error('Der Authenticator konnte nicht erreicht werden...');
        }
    }
}

export class Oauth2PasswordProvider extends Oauth2Provider {
    /**
     * Get token by password.
     *
     * @param username
     * @param password
     */
    async getToken(username: string, password: string) : Promise<LoginToken> {
        let params : {[key: string] : any} = {
            grant_type: 'password',
            client_id: this.provider.client_id,
            username,
            password
        }

        if(this.provider.client_secret) {
            params.client_secret = this.provider.client_secret;
        }

        return this.tokenRequest(params);
    }
}

export type Oauth2AuthorizeTokenParameter = {
    code: string,
    state?: string,
    redirect_uri?: string
}

export class Oauth2AuthorizeProvider extends Oauth2Provider {
    authorizeUrl(params: {[key: string] : any} = {}) : string {
        const baseParams : {[key: string] : any} = {
            response_type: 'code',
            grant_type: 'authorization_code',
            client_id: this.provider.client_id,
            redirect_uri: env.apiUrl + '/providers/'+this.provider.id+'/authorize-callback'
        }

        if(this.provider.scope) {
            params.scope = this.provider.scope;
        }

        Object.assign(baseParams, params);

        const host = this.provider.authorize_host ? this.provider.authorize_host : this.provider.token_host;
        const path = this.provider.authorize_path ? this.provider.authorize_path : '/oauth/authorize';

        return host + path + buildQuery(baseParams);
    }

    async getToken(tokenParameter: Oauth2AuthorizeTokenParameter) : Promise<LoginToken> {
        let params : {[key: string] : any} = {
            grant_type: 'authorization_code',
            client_id: this.provider.client_id,
            redirect_uri: env.apiUrl + '/providers/'+this.provider.id+'/authorize-callback'
        }

        if(this.provider.scope) {
            params.scope = this.provider.scope;
        }

        if(this.provider.client_secret) {
            params.client_secret = this.provider.client_secret;
        }

        Object.assign(params, tokenParameter);

        return this.tokenRequest(params);
    }
}
