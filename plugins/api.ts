import {registerApi} from "~/modules/api";
import {Context} from "@nuxt/types";

export default (ctx: Context) => {
    if (typeof ctx.$config.resourceApiUrl === 'string') {
        registerApi('resource', {
            baseURL: ctx.$config.resourceApiUrl
        }, ctx);
    }

    if (typeof ctx.$config.authApiUrl === 'string') {
        registerApi('auth', {
            baseURL: ctx.$config.authApiUrl
        }, ctx);
    }
}
