import BaseStorage from "~/modules/storage";
import {Context} from "@nuxt/types";
import {StorageOptionsInterface} from "~/modules/storage/types";

export class AuthStorage extends BaseStorage {
    constructor(ctx: Context, options?: StorageOptionsInterface) {
        options = options ?? {};

        const defaultOptions : StorageOptionsInterface = {
            cookie: {
                path: '/'
            },
            localStorage: true,
            sessionStorage: false,
            namespace: 'auth'
        }

        options = Object.assign({}, defaultOptions, options);

        super(ctx, options);
    }
}

export default AuthStorage;
