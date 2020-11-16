import { decode } from "jsonwebtoken";

import UserProviderModel from "../../../domains/user/provider/UserProviderModel";
import UserModel from "../../../domains/user/UserModel";
import KeycloakApi, {KeycloakAccessToken} from "../../api/KeycloakApi";
import {Provider} from "./provider";
import UserProviderEntity from "../../../domains/user/provider/UserProviderEntity";
import RoleModel from "../../../domains/role/RoleModel";
import UserRoleModel from "../../../domains/user/role/UserRoleModel";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../../domains/user/repository";

export class KeyCloakProvider extends Provider {
    private api: KeycloakApi;
    private providerID : string = 'keycloak';

    constructor() {
        super();

        this.api = new KeycloakApi();
    }

    /**
     * Login with Password Grant
     *
     * @param name
     * @param password
     *
     * @return Promise<UserProviderEntity>
     *
     * @throws Error
     */
    async loginWithPasswordGrant(name: string, password: string) : Promise<UserProviderEntity> {
        const token = await this.api.attemptAccessToken({
            username: name,
            password,
            grant_type: 'password'
        });

        const userProvider = await this.loginWithToken(token);

        const userRepository = getCustomRepository(UserRepository);
        await userRepository
            .createQueryBuilder('user')
            .update()
            .set({
                password: await userRepository.hashPassword(password)
            })
            .where("id = :id", {id: userProvider.user_id})
            .execute();

        return userProvider;
    }

    /**
     *
     * @param token KeycloakAccessToken
     *
     * @return Promise<UserProviderEntity>
     *
     * @throws Error
     */
    async loginWithToken(token: KeycloakAccessToken) : Promise<UserProviderEntity> {
        const tokenPayload : string | {[key: string] : any} = decode(token.accessToken);
        if(typeof tokenPayload === 'string') {
            throw new Error('Could not decode tokenPayload...');
        }

        const providerUserId : string = tokenPayload.sub;
        const providerRoles : string[] = tokenPayload?.realm_access?.roles ?? [];
        const providerUserName : string =  tokenPayload.preferred_username ?? this.providerID+':'+providerUserId;

        let query = UserProviderModel().findOne({
            provider_id: this.providerID,
            provider_user_id: providerUserId
        })

        let entity = <UserProviderEntity> await query;
        if(entity) {
            const updateData = {
                'access_token': token.accessToken,
                'refresh_token': token.refreshToken,
                'expires_in': new Date().toISOString()
            };

            await UserProviderModel().update(updateData, entity.id);

            await this.updateOrCreateUserRoles(entity.user_id, providerRoles);

            return Object.assign({}, entity, updateData);
        } else {
            const userId : number = (await UserModel().create({
                name: providerUserName,
                email: providerUserName + '@' + this.providerID + '.local'
            }))[0];

            const data = {
                'provider_id': this.providerID,
                'provider_user_id': providerUserId,
                'provider_user_name': providerUserName,
                'user_id': userId,
                'expires_in': new Date().toISOString(),
                'access_token': token.accessToken,
                'refresh_token': token.refreshToken
            };

            const userProviderId : number = (await UserProviderModel().create(data))[0];

            await this.updateOrCreateUserRoles(userId, providerRoles);

            return {
                ...data,
                id: userProviderId
            }
        }
    }

    async refreshToken(accessToken: string) {

    }

    // -----------------------

    protected async updateOrCreateUserRoles(userId: number, ids: string[]) : Promise<void> {
        const roles = await RoleModel().findAll().whereIn('keycloak_role_id', ids);
        if(!roles) return;

        let roleIds : number[] = roles.map((item: any) => {
            return item.id;
        });

        await UserRoleModel().syncUserRoles(userId, roleIds);
    }
}
