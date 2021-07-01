import {Context} from "@nuxt/types";
import {Inject} from "@nuxt/types/app";

import AuthModule from "~/modules/auth";

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
    const auth = new AuthModule(context, {
        tokenHost: context.$config.apiUrl,
        tokenPath: 'token',
        userInfoPath: 'users/me'
    });

    inject('auth',auth);
}
