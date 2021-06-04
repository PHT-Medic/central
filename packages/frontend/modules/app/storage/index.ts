import BaseStorage from "~/modules/storage";
import {Context} from "@nuxt/types";
import {StorageOptionsInterface} from "~/modules/storage/types";

export class AppStorage extends BaseStorage {
    constructor(ctx: Context, options?: StorageOptionsInterface) {
        options = options ?? {};

        const defaultOptions : StorageOptionsInterface = {
            namespace: 'app'
        };

        options = Object.assign({}, defaultOptions, options);

        super(ctx, options);
    }
}

export default AppStorage;
