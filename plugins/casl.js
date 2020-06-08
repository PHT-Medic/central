import Vue from 'vue'
import {abilitiesPlugin, Can} from "@casl/vue";
import { ability } from "./caslAbility";

export default ({ app, env }) => {
    Vue.use(abilitiesPlugin, ability);
    Vue.component('Can', Can);

    app.$can = function () {
        return ability.can(...arguments);
    };
}
