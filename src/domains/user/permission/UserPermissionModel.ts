import Knex from 'knex';
import {builder} from "../../../db";

import PermissionModel from "../../permission/PermissionModel";
import {UserAbilityPermissionInterface} from "../../../services/auth/helpers/userAbility";

//--------------------------------------------------------------------

const UserPermissionModel = (knex?: Knex) => {
    const model = builder('auth_user_permissions', knex);

    //--------------------------------------------------------------------

    /**
     * Receive user permissions.
     *
     * @param userId
     * @param whereQueryCallback
     *
     * @return Promise<UserAbilityPermissionInterface[]>
     */
    const getPermissions = async (userId: number, whereQueryCallback?: any) : Promise<UserAbilityPermissionInterface[]> => {
        let permissionTable = PermissionModel()._getTable();
        let userPermissionTable = UserPermissionModel()._getTable();

        try {
            let query = model._findAll();

            let where: any = {};
            where[userPermissionTable+'.user_id'] = userId;

            if(typeof whereQueryCallback === 'function') {
                where = {...where, ...whereQueryCallback(query)}
            }

             query = query
                 .select(permissionTable+'.*')
                 .select(userPermissionTable+'.condition')
                 .select(userPermissionTable+'.scope')
                 .select(userPermissionTable+'.power')
                 .select(userPermissionTable+'.power_inverse')
                .where(where)
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

export default UserPermissionModel;

export {
    UserPermissionModel,
    findUserPermissionCallback
}

//---------------------------------------------------
const findUserPermissionCallback = (query: any, id: string | number) => {
    let userPermissionTable = UserPermissionModel()._getTable();
    let permissionTable = PermissionModel()._getTable();

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
