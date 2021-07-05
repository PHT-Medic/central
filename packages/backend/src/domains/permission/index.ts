import {
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {RolePermission} from "../role/permission";

@Entity()
export class Permission {
    @PrimaryColumn({type: "varchar", length: 100, generated: false})
    id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
    role_permissions: RolePermission[]
}
