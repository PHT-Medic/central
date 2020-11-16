import Knex from 'knex';
import { builder } from "../../db";
import {UserAbilityPermissionInterface} from "../../services/auth/helpers/userAbility";
import PermissionModel from "../permission/PermissionModel";
import RolePermissionModel from "./permission/RolePermissionModel";

//--------------------------------------------------------------------

export const RoleModel = (knex?: Knex) => {
    const model = builder('auth_roles', knex, {
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
            let query = RolePermissionModel(knex).findAll();

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
            throw new Error('Unable to receive role permissions.');
        }
    };

    return {
        ...model,
        getPermissions
    }
};

export default RoleModel;

