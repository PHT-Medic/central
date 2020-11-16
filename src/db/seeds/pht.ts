import Knex from "knex";
import RoleModel from "../../domains/role/RoleModel";
import RoleEntity from "../../domains/role/RoleEntity";
import PermissionEntity from "../../domains/permission/PermissionEntity";
import PermissionModel from "../../domains/permission/PermissionModel";
import RolePermissionEntity from "../../domains/role/permission/RolePermissionEntity";
import RolePermissionModel from "../../domains/role/permission/RolePermissionModel";

//----------------------------------------------

export async function seed(knex: Knex) : Promise<any> {
    let roles = [
        'StationAuthority', // 0
        'StationEmployee' // 1
    ];

    let permissions = [
        'proposal_add', // 0 : [0,1]
        'proposal_drop', // 1 : [0,1]
        'proposal_edit', // 2 : [0,1]
        'proposal_approve', //3 : [0]
        'train_approve', // 4 : [0]
        'train_edit', // 5 : [0]
        'train_add', // 6 : [0,1]
        'train_execution_start', // 7 : [0,1]
        'train_execution_drop', // 8 : [0,1]
        'train_drop', // 9 : [0,1]
        'train_result_read', // 10 : [0,1]
        'station_add',
        'station_drop',
        'station_edit'
    ];

    let rolePermissions: {[key: number] : number[]} = {
        0: [0,1,2,3,5,6,7,8,9,10],
        1: [0,1,2,6,7,8,9,10]
    };

    // Roles

    const dbRoles : RoleEntity[] = roles.map((role: string) => {
        return {
            name: role,
            keycloak_role_id: role
        }
    });

    let roleIds : number[] = await RoleModel().create(dbRoles);

    if(roleIds.length < dbRoles.length) {
        let startId: number = roleIds[0] - dbRoles.length + 1;

        for(let i=0; i<dbRoles.length; i++) {
            roleIds[i] = startId + i;
        }
    }

    // Permissions

    const dbPermissions : PermissionEntity[] = permissions.map((permission: string) => {
        return {
            name: permission,
        }
    });

    const permissionIds : number[] = await PermissionModel().create(dbPermissions);
    if(permissionIds.length < dbPermissions.length) {
        let startId: number = permissionIds[0] - dbPermissions.length + 1;

        for(let i=0; i<dbPermissions.length; i++) {
            permissionIds[i] = startId + i;
        }
    }

    // Role Permissions

    let dbRolePermissions : RolePermissionEntity[] = [];
    for(let key in rolePermissions) {
        for(let i=0; i<rolePermissions[key].length; i++) {
            dbRolePermissions.push({
                role_id: roleIds[key],
                permission_id: permissionIds[rolePermissions[key][i]]
            })
        }
    }

    await RolePermissionModel().create(dbRolePermissions);
    return;
}
