import Knex from 'knex';
import { builder } from "../../../db";

//--------------------------------------------------------------------

export const UserRoleModel = (knex?: Knex) => {
    const model = builder('auth_user_roles', knex, {
        created_at: true,
        updated_at: true
    });

    async function syncUserRoles(userId: number, roleIds: number[]) {
        let userRoleIds : number[] = [];

        let rolesToAdd : number[] = [];
        let rolesToDrop : number[] = [];

        if(roleIds.length > 0) {
            const userRoles = await model.findAll()
                .where({user_id: userId});

            for(let i=0; i<userRoles.length; i++) {
                let userRoleId = userRoles[i].role_id;

                userRoleIds.push(userRoleId);

                if(roleIds.indexOf(userRoleId) === -1) {
                    rolesToDrop.push(userRoleId);
                }
            }
        }

        if(userRoleIds.length > 0) {
            for(let i=0; i<roleIds.length; i++) {
                let roleId = roleIds[i];

                if(userRoleIds.indexOf(roleId) === -1) {
                    rolesToAdd.push(roleId);
                }
            }
        } else {
            rolesToAdd = roleIds;
        }

        if(rolesToAdd.length > 0) {
            let data = [];

            for(let i=0; i<rolesToAdd.length; i++) {
                data.push({
                    role_id: rolesToAdd[i],
                    user_id: userId
                })
            }

            await model.create(data);
        }

        if(rolesToDrop.length > 0) {
            await model.builder()
                .whereIn('role_id', rolesToDrop)
                .where({user_id: userId})
                .delete();
        }
    }

    return {
        ...model,
        syncUserRoles
    }
};

export default UserRoleModel;

