import {Context} from "@nuxt/types";
import {Inject} from "@nuxt/types/app";

import AuthModule from "~/modules/auth";
import AuthStrategies from "~/config/auth";
import {registerAuthScheme} from "~/modules/auth/schemes";

declare module 'vue/types/vue' {
    // this.$myInjectedFunction inside Vue components
    interface Vue {
        $auth: AuthModule
    }
}

declare module '@nuxt/types' {
    // nuxtContext.$myInjectedFunction
    interface Context {
        $auth: AuthModule
    }
}

declare module 'vuex/types/index' {
    // this.$myInjectedFunction inside Vuex stores
    interface Store<S> {
        $auth: AuthModule
    }
}

export default (context: Context, inject: Inject) => {
    const strategies = AuthStrategies;

    for(let key in strategies) {
        registerAuthScheme(key, strategies[key]);
    }

    const auth = new AuthModule(context);
    inject('auth',auth);
}
