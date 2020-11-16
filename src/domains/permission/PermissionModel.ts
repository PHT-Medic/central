import Knex from 'knex';
import { builder } from "../../db";

//--------------------------------------------------------------------

export const PermissionModel = (knex?: Knex) => {
    const model = builder('auth_permissions', knex, {
        created_at: true,
        updated_at: true
    });

    return {
        ...model
    }
};

export default PermissionModel;

