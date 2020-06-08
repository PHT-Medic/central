import Knex from 'knex';
import { builder } from "../../../../db";

import {AuthAbility, transformScopeToAbility} from "../../../../services/auth/helpers/permissionHelper";
import AuthPermissionModel from "../../permission/AuthPermissionModel";
import AuthPermissionEntity from "../../permission/AuthPermissionEntity";

//--------------------------------------------------------------------

interface AuthUserPermissionInterface extends AuthPermissionEntity {
    scope: any,
    power: number | null
}

//--------------------------------------------------------------------

const AuthUserPermissionModel = (knex?: Knex) => {
    const model = builder('auth_user_permissions', knex);

    /**
     * Receive user abilities.
     *
     * @param userId
     *
     * @return Promise<AuthAbility[]>
     */
    const getAbilities = async (userId: number) : Promise<AuthAbility[]> => {
        let permissions = await getPermissions(userId);
        let abilities: AuthAbility[] = [];

        for(let i=0; i<permissions.length; i++) {
            let { name, scope } = permissions[i];

            let ability = transformScopeToAbility(name, scope);
            abilities.push(ability);
        }

        return abilities;
    };

    /**
     * Receive user permissions.
     *
     * @param userId
     * @param whereQueryCallback
     *
     * @return Promise<AuthUserPermissionInterface[]>
     */
    const getPermissions = async (userId: number, whereQueryCallback?: any) : Promise<AuthUserPermissionInterface[]> => {
        let permissionTable = AuthPermissionModel()._getTable();
        let userPermissionTable = AuthUserPermissionModel()._getTable();

        try {
            let query = model._findAll();

            let where: any = {};
            where[userPermissionTable+'.user_id'] = userId;

            if(typeof whereQueryCallback === 'function') {
                where = {...where, ...whereQueryCallback(query)}
            }

             query = query
                .select(permissionTable+'.*')
                .select(userPermissionTable+'.permission_scope as scope')
                 .select(userPermissionTable+'.permission_power as power')
                .where(where)
                .leftJoin(permissionTable,permissionTable+'.id',userPermissionTable+'.permission_id');

            let result = await query;

            for(let i=0; i<result.length; i++) {
                result[i] = <AuthUserPermissionInterface> result[i];
            }

            return result;
        } catch(e) {
            throw new Error('Unable to receive user permissions.');
        }
    };


    return {
        ...model,
        getAbilities,
        getPermissions
    }
};

export default AuthUserPermissionModel;

export {
    AuthUserPermissionInterface,
    AuthUserPermissionModel
}

