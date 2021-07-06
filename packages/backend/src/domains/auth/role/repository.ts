import {EntityRepository, In, Repository} from "typeorm";
import {Role} from "./index";
import {RolePermission} from "./permission";
import {OwnedPermission} from "@typescript-auth/core";

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
    async getOwnedPermissions(
        roleId: number | number[]
    ) : Promise<OwnedPermission<unknown>[]> {
        if(!Array.isArray(roleId)) {
            roleId = [roleId];
        }

        if(roleId.length === 0) {
            return [];
        }

        const repository = this.manager.getRepository(RolePermission);

        const entities = await repository.find({
            role_id: In(roleId)
        });

        const result : OwnedPermission<unknown>[] = [];
        for(let i=0; i<entities.length; i++) {
            result.push({
                id: entities[i].permission_id,
                condition: entities[i].condition,
                power: entities[i].power,
                fields: entities[i].fields,
                negation: entities[i].negation
            })
        }

        return result;
    }
}
