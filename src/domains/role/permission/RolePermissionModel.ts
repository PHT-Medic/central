import Knex from 'knex';
import {builder} from "../../../db";

import PermissionModel from "../../permission/PermissionModel";
import {UserAbilityPermissionInterface} from "../../../services/auth/helpers/userAbility";

//--------------------------------------------------------------------

const RolePermissionModel = (knex?: Knex) => {
    const model = builder('auth_role_permissions', knex, {
        created_at: true,
        updated_at: true
    });

    //--------------------------------------------------------------------

    /**
     * Receive user permissions.
     *
     * @param roleId
     *
     * @return Promise<UserAbilityPermissionInterface[]>
     */
    const getPermissions = async (roleId: number | number[]) : Promise<UserAbilityPermissionInterface[]> => {
        let permissionTable = PermissionModel(knex).getTable();
        let userPermissionTable = RolePermissionModel(knex).getTable();

        try {
            let query = model.findAll();

            if(typeof roleId === 'number') {
                query.where({
                    role_id: roleId
                });
            } else {
                if(roleId.length > 0) {
                    query.whereIn('role_id', roleId);
                }
            }

             query
                 .select(permissionTable+'.*')
                 .select(userPermissionTable+'.condition')
                 .select(userPermissionTable+'.scope')
                 .select(userPermissionTable+'.power')
                 .select(userPermissionTable+'.power_inverse')
                 .leftJoin(permissionTable,permissionTable+'.id',userPermissionTable+'.permission_id');

            let result = await query;

            for(let i=0; i<result.length; i++) {
                result[i] = <UserAbilityPermissionInterface> result[i];
            }

            return result;
        } catch(e) {
            throw new Error('Unable to receive user permissions.');
        }
    };


    return {
        ...model,
        getPermissions
    }
};

export default RolePermissionModel;

export {
    RolePermissionModel,
    findUserPermissionCallback
}

//---------------------------------------------------
const findUserPermissionCallback = (query: any, id: string | number) => {
    let userPermissionTable = RolePermissionModel().getTable();
    let permissionTable = PermissionModel().getTable();

    let keyOb: any = {};

    keyOb[userPermissionTable+'.permission_id'] = id;

    query.select(userPermissionTable+'.*')
    query.where(keyOb);

    //-------------

    keyOb = {};

    keyOb[permissionTable+'.name'] = id;

    query.join(permissionTable, permissionTable+'.id', userPermissionTable+'.permission_id');
    return query.orWhere(keyOb);
};
