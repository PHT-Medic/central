import { AbilityBuilder, Ability } from "@casl/ability";

import AuthUserPermissionModel from "../../domains/auth/user/permission/AuthUserPermissionModel";
import {AuthAbility} from "./helpers/permissionHelper";

const AuthorizationService = {
    async defineAbilitiesFor(userId: number | null) {
        if(!userId) {
            return new Ability();
        }

        let abilities = await AuthUserPermissionModel().getAbilities(userId);

        const { can, rules } = new AbilityBuilder();

        for(let i=0; i<abilities.length; i++) {
            let ability: AuthAbility = abilities[i];

            can(ability.action, ability.subject, ability.condition, ability.fields);
        }

        // @ts-ignore
        return new Ability(rules);
    },

    async hasPermission(permission: number | string, userId: number) {

    },
    async hasPermissions(permissions: number[] | string[], userId: number) {

    }
}


//---------------------------------------------

export default AuthorizationService;
