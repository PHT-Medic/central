import UserPermissionModel from "../../domains/user/permission/UserPermissionModel";
import UserAbility, {UserAbilityPermissionInterface} from "./helpers/userAbility";

const AuthorizationService = {
    async defineAbilityFor(userId: number | null) : Promise<UserAbility> {
        let permissions: UserAbilityPermissionInterface[] = [];

        if(typeof userId === 'number') {
            permissions = await UserPermissionModel().getPermissions(userId);
        }

        return new UserAbility(permissions);
    }
}


//---------------------------------------------

export default AuthorizationService;
