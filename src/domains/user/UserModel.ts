import Knex from 'knex';
import { builder } from "../../db";
import { AuthUserEntity } from './AuthUserEntity';

import { hashPassword, verifyPassword } from "../../services/auth/helpers/authHelper";
import UserEntity from "./UserEntity";
import LoggerService from "../../services/loggerService";
import {onlyOneRow} from "../../db/helpers/queryHelper";

//--------------------------------------------------------------------

type UserCredentials = {
    name: string,
    password: string
}

//--------------------------------------------------------------------

export const UserModel = (knex?: Knex) => {
    const model = builder('auth_users', knex);

    /**
     * Create single user.
     *
     * @param data
     */
    const createUser = async (data: AuthUserEntity) => {
        data.password = await hashPassword(data.password);
        return model._create(data);
    };

    /**
     * Create multiple users.
     *
     * @param data
     */
    const createUsers = async (data: AuthUserEntity[]) => {
        for(let i=0; i<data.length; i++) {
            data[i].password = await hashPassword(data[i].password);
        }

        return model._create(data);
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
            let query = model._findOne()
                .select('id')
                .select('name')
                .select('password')
                .where('name', 'like', '%'+credentials.name+'%');

            result = <AuthUserEntity> await onlyOneRow(query);
        } catch (e) {
            LoggerService.warn('user "' + credentials.name + '" does not exist...');
            throw new Error('Name oder Passwort ist falsch...');
        }

        let {password, ...user} = result;

        let passwordVerified = await verifyPassword(credentials.password, password);
        if(!passwordVerified) {
            LoggerService.warn('password for user "' + credentials.name + '" is wrong...');
            throw new Error('Name oder Passwort ist falsch...')
        }

        LoggerService.info('user "' + credentials.name + '" logged in...')

        return <UserEntity> user;
    };

    return {
        ...model,
        createUser,
        createUsers,
        verifyCredentials,
        hashPassword,
        verifyPassword
    }
};

export default UserModel;

