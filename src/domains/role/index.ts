import {
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinTable,
    ManyToMany, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../user";
import {RolePermission} from "./permission";

@Entity()
export class Role {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({type: 'varchar', length: 30})
    @Index({unique: true})
    name: string;

    @Column({type: "varchar", length: 100, nullable: true, default: null})
    keycloak_role_id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @ManyToMany(() => User, user => user.roles)
    @JoinTable()
    users: User[];

    @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
    pivotPermissions: RolePermission[]
}
