import {Oauth2TokenResponse} from "@typescript-auth/core";
import {getCustomRepository, getRepository} from "typeorm";
import {Oauth2ProviderAccount} from "./index";
import {RoleRepository} from "../../role/repository";
import {Role} from "../../role";
import {UserRepository} from "../../user/repository";
import {OAuth2Provider} from "../index";

export async function createOauth2ProviderAccountWithToken(
    provider: OAuth2Provider,
    tokenResponse: Oauth2TokenResponse
) : Promise<Oauth2ProviderAccount> {
    const accountRepository = getRepository(Oauth2ProviderAccount);
    let account = await accountRepository.findOne({
        provider_user_id: tokenResponse.access_token_payload.sub as string,
        provider_id: provider.id
    }, {relations: ['user']});

    const expiresIn : number = (tokenResponse.access_token_payload.exp - tokenResponse.access_token_payload.iat);

    const originalUsername : string | undefined = tokenResponse.access_token_payload.preferred_username ?? tokenResponse.access_token_payload.sub;
    const destinationUsername = provider.realm_id + '-' + originalUsername;

    const userRepository = getCustomRepository(UserRepository);

    if(typeof account !== 'undefined') {
        account = accountRepository.merge(account, {
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            expires_at: new Date((tokenResponse.access_token_payload.iat * 1000) + (expiresIn * 1000)),
            expires_in: expiresIn
        });
    } else {
        const user = userRepository.create({
            name: destinationUsername,
            display_name: originalUsername ?? destinationUsername,
            realm_id: provider.realm_id
        });

        await userRepository.insert(user);

        account = accountRepository.create({
            provider_id: provider.id,
            provider_user_id: tokenResponse.access_token_payload.sub as string,
            provider_user_name: originalUsername ?? destinationUsername,
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            expires_at: new Date((tokenResponse.access_token_payload.iat * 1000) + (expiresIn * 1000)),
            expires_in: expiresIn,
            user_id: user.id,
            user
        });
    }

    await accountRepository.save(account);

    if(typeof tokenResponse.access_token_payload?.realm_access?.roles !== 'undefined') {
        const roleRepository = getCustomRepository(RoleRepository);

        const roles: Role[] = await roleRepository
            .createQueryBuilder('role')
            .where("role.provider_role_id in (:...id)", {id: tokenResponse.access_token_payload?.realm_access?.roles})
            .getMany();

        await userRepository.syncRoles(account.user.id, roles);
    }

    return account;
}
