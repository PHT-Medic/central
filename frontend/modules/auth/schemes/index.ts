import {AuthSchemeInterface, AuthSchemeOptions} from "~/modules/auth/types";
import Oauth2Scheme from "~/modules/auth/schemes/oauth2";
import AuthJWTScheme from "~/modules/auth/schemes/jwt";

//---------------------------------------------------------------------------------

let instances: { [key: string]: AuthSchemeInterface } = {};

export function useAuthScheme(name: string, options?: AuthSchemeOptions) {
    if (!instances.hasOwnProperty(name)) {
        if (typeof options === 'undefined') {
            throw new Error('No strategy options provided.');
        }

        registerAuthScheme(name, options);
    }

    const instance = instances[name];
    if (options) {
        instance.setOptions(options);
    }

    return instance;
}

export function registerAuthScheme(name: string, options: AuthSchemeOptions) {
    if (instances.hasOwnProperty(name)) return;

    instances[name] = createAuthScheme(name, options);
}

/**
 * Create new Base Api instance.
 *
 * @param name
 * @param options
 */
export function createAuthScheme(name: string, options: AuthSchemeOptions) {
    if (options.scheme === 'Oauth2') {
        return new Oauth2Scheme(options);
    }

    if (options.scheme === 'JWT') {
        return new AuthJWTScheme(options);
    }

    throw new Error('Scheme not supported.');
}
