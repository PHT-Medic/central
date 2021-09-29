import {
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {RolePermission} from "../role-permission";

@Entity({name: 'permissions'})
export class Permission {
    @PrimaryColumn({type: "varchar", length: 100, generated: false})
    id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
    role_permissions: RolePermission[]
}
