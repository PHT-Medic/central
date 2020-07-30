import Vue from 'vue'
import {abilitiesPlugin, Can} from "@casl/vue";
import { ability } from "./caslAbility";

const getPermissionByName = (permissions, searchName) => {
    for(let i=0; i<permissions.length; i++) {
        let { name } = permissions[i];

        if(name === searchName) {
            return permissions[i];
        }
    }

    throw new Error('Sie verfügen nicht über diese Berechtigung.');
}

const getPermissionPowerByName = (permissions, type, permissionName, strict) => {
    strict = typeof strict !== 'undefined' && typeof strict === 'boolean' ? strict : false;
    let permission;

    try {
        permission = getPermissionByName(permissions, permissionName);
    } catch (e) {
        if(strict) {
            throw new Error(e.message);
        }

        return 0;
    }

    switch(type) {
        case 'power':
            if(!permission.hasOwnProperty('power') || permission.power === null) {
                if(strict) {
                    throw new Error('Sie haben keine gesetzte Berechtigunspower.');
                }

                return 0;
            }

            return permission.power;
        case 'powerInverse':
            if(!permission.hasOwnProperty('power_inverse') || permission.power_inverse === null) {
                if(strict) {
                    throw new Error('Sie haben keine gesetzte Inverse-Berechtigunspower.');
                }

                return 0;
            }

            return permission.power_inverse;
    }
}

export default ({ app, store, env }, inject) => {
    Vue.use(abilitiesPlugin, ability);
    Vue.component('Can', Can);

    app.$can = function () {
        return ability.can(...arguments);
    };

    //-------------------------------------------------

    const permission = {
        has: function (name) {
            try {
                getPermissionByName(store.state.auth.permissions,name);
                return true;
            } catch (e) {
                return false;
            }
        },
        can: function() {
            return ability.can(...arguments);
        },
        getPower: function() {
            return getPermissionPowerByName(store.state.auth.permissions,'power', ...arguments);
        },
        getPowerInverse: function() {
            return getPermissionPowerByName(store.state.auth.permissions,'powerInverse',...arguments);
        }
    }

    inject('permission',permission);
    app.$permission = permission;
}
