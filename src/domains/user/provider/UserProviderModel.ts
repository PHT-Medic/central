import Knex from 'knex';
import { builder } from "../../../db";

//--------------------------------------------------------------------

export const UserProviderModel = (knex?: Knex) => {
    const model = builder('auth_user_providers', knex);

    return {
        ...model
    }
};

export default UserProviderModel;

