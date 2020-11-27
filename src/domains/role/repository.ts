import {EntityRepository, getRepository, Repository} from "typeorm";
import {Role} from "./index";
import {RolePermission} from "./permission";
import {PermissionInterface} from "../../services/auth";

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
    async getPermissions(roleId: number | number[]) : Promise<PermissionInterface[]> {
        const pivotRepository = getRepository<RolePermission>(RolePermission);

        const queryBuilder = pivotRepository.createQueryBuilder('pivotTable');
        queryBuilder.leftJoinAndSelect('pivotTable.permission', 'permission', 'permission.id = pivotTable.permission_id');

        if(typeof roleId === 'number') {
            queryBuilder.where("pivotTable.role_id = :id", {id: roleId});
        } else {
            if(roleId.length > 0) {
                queryBuilder.where("pivotTable.role_id IN (:...ids)", {ids: roleId});
            }
        }

        const pivotEntities = await queryBuilder.getMany();

        let items : PermissionInterface[] = [];

        for(let i=0; i<pivotEntities.length; i++) {
            items.push({
                id: pivotEntities[i].permission.id,
                name: pivotEntities[i].permission.name,
                scope: pivotEntities[i].scope,
                condition: pivotEntities[i].condition,
                power: pivotEntities[i].power
            })
        }

        return items;
    }
}
