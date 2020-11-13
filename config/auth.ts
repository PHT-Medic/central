import { AuthSchemeOptions } from "~/modules/auth/types";

const AuthStrategies : { [key: string] : AuthSchemeOptions } = {
    local: {
        scheme: "JWT",
        endpoints: {
            api: "auth",
            userInfo: "me",
            token: "token"
        }
    }
};

export default AuthStrategies;
