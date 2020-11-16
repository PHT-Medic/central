import Knex from 'knex';
import { builder } from "../../db";
import { AuthUserEntity } from './AuthUserEntity';

import { hashPassword, verifyPassword } from "../../services/auth/helpers/authHelper";
import UserEntity from "./UserEntity";
import LoggerService from "../../services/loggerService";
import {onlyOneRow} from "../../db/helpers/queryHelper";
import UserRoleModel from "./role/UserRoleModel";
import RolePermissionModel from "../role/permission/RolePermissionModel";
import UserRoleEntity from "./role/UserRoleEntity";

//--------------------------------------------------------------------

type UserCredentials = {
    name: string,
    password: string
}

//--------------------------------------------------------------------

export const UserModel = (knex?: Knex) => {
    const model = builder('auth_users', knex, {
        'created_at': true,
        'updated_at': true
    });

    /**
     * Create single user.
     *
     * @param data
     */
    const create = async (data: AuthUserEntity) => {
        if(data.hasOwnProperty('password')) {
            data.password = await hashPassword(data.password);
        }



        return model.create(data);
    };

    /**
     * Create multiple users.
     *
     * @param data
     */
    const createMultiple = async (data: AuthUserEntity[]) => {
        for(let i=0; i<data.length; i++) {
            if(data[i].hasOwnProperty('password')) {
                data[i].password = await hashPassword(data[i].password);
            }
        }

        return model.create(data);
    }

    /**
     * Get user permissions.
     *
     * @param userId
     */
    const getPermissions = async (userId: number) => {
        let result : UserRoleEntity[] = <UserRoleEntity[]> await UserRoleModel(knex).find({
            user_id: userId
        });

        if(result && result.length > 0) {
            let roleIds : number[] = result.map((item) => {
                return item.role_id;
            });

            return await RolePermissionModel(knex).getPermissions(roleIds)
        }

        return [];
    }
    /**
     * Verifies user credentials.
     *
     * @param credentials
     */
    const verifyCredentials = async (credentials: UserCredentials) : Promise<UserEntity> => {
        if(!credentials.name || !credentials.password) {
            throw new Error('Name und Passwort müssen angegeben sein...');
        }

        let result;
        try {
            let query = model.findOne()
                .select('id')
                .select('name')
                .select('password')
                .where('name', 'like', '%'+credentials.name+'%');

            result = <AuthUserEntity> await onlyOneRow(query);
        } catch (e) {
            console.log(e);
            LoggerService.warn('user "' + credentials.name + '" does not exist...');
            throw new Error('Die Zugagnsdaten sind nicht gültig...');
        }

        let {password, ...user} = result;

        let passwordVerified = await verifyPassword(credentials.password, password);
        if(!passwordVerified) {
            LoggerService.warn('password for user "' + credentials.name + '" is wrong...');
            throw new Error('Die Zugangsdaten sind nicht gültig...')
        }

        LoggerService.info('user "' + credentials.name + '" logged in...')

        return <UserEntity> user;
    };

    return {
        ...model,
        create,
        createMultiple,
        verifyCredentials,
        hashPassword,
        verifyPassword,
        getPermissions
    }
};

export default UserModel;

