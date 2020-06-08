import Knex from 'knex';
import { builder } from "../../../db";

//--------------------------------------------------------------------

export const AuthPermissionModel = (knex?: Knex) => {
    const model = builder('auth_permissions', knex);

    return {
        ...model
    }
};

export default AuthPermissionModel;

