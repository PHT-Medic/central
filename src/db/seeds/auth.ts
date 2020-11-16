import Knex from "knex";
//----------------------------------------------

import AuthConfig from "../../config/auth";

import UserModel from "../../domains/user/UserModel";
import PermissionModel from "../../domains/permission/PermissionModel";
import RolePermissionModel from "../../domains/role/permission/RolePermissionModel";
import PermissionEntity from "../../domains/permission/PermissionEntity";
import RoleModel from "../../domains/role/RoleModel";
import UserRoleModel from "../../domains/user/role/UserRoleModel";

//----------------------------------------------

const permissions: PermissionEntity[] = AuthConfig.permissions;

//----------------------------------------------

export async function seed(knex: Knex) : Promise<any> {
    const userModel = UserModel(knex);
    await userModel.builder().del();

    const user = {name: 'admin', password: 'start123', email: 'peter.placzek1996@gmail.com'};
    const userId: number = (await userModel.create(user))[0];

    //-------------------------------------------------

    const roleModel = RoleModel(knex);
    await roleModel.builder().del();

    const role = {name: 'admin'};
    const roleId : number = (await roleModel.create(role))[0];

    //-------------------------------------------------

    const userRoleModel = UserRoleModel(knex);
    await userRoleModel.builder().del();

    await userRoleModel.create({
        user_id: userId,
        role_id: roleId
    });

    //-------------------------------------------------

    const permissionModel = PermissionModel(knex);
    await permissionModel.builder().del();

    const permissionIds : number[] = await permissionModel.create(permissions);
    if(permissionIds.length < permissions.length) {
        let startId: number = permissionIds[0] - permissions.length + 1;

        for(let i=0; i<permissions.length; i++) {
            permissionIds[i] = startId + i;
        }
    }

    //-------------------------------------------------

    let rolePermissionModel = RolePermissionModel(knex);
    await rolePermissionModel.builder().del();

    let rolePermissions = [];

    for(let j=0; j<permissions.length; j++) {
        let userPermission = {
            role_id: roleId,
            permission_id: permissionIds[j]
        };

        rolePermissions.push(userPermission);
    }

    await rolePermissionModel.create(rolePermissions);
    return;
}
