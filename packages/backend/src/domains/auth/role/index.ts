import {
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinTable,
    ManyToMany, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {RolePermission} from "./permission";
import {UserRole} from "../user/role";

@Entity({name: 'roles'})
export class Role {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({type: 'varchar', length: 30})
    @Index({unique: true})
    name: string;

    @Column({type: "varchar", length: 100, nullable: true, default: null})
    provider_role_id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @OneToMany(() => UserRole, userRole => userRole.role)
    user_roles: UserRole[]

    @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
    role_permissions: RolePermission[]
}
