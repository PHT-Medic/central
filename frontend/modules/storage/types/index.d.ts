import { CookieSerializeOptions} from "cookie";

export interface StorageOptionsInterface {
    namespace?: string,
    ignoreExceptions?: boolean,
    localStorage?: boolean,
    sessionStorage?: boolean,
    cookie?: boolean | CookieSerializeOptions
}
