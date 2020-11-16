import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Role} from "../index";
import {Permission} from "../../permission";

@Entity()
@Index(['permission_id', 'role_id'], {unique: true})
export class RolePermission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    permission_id!: number;

    @Column()
    role_id!: number;

    @Column({type: 'int', default: 999})
    power: number;

    @Column({type: 'text', nullable: true, default: null})
    scope: string;

    @Column({type: 'text', nullable: true, default: null})
    condition: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @ManyToOne(() => Role, role => role.pivotPermissions)
    @JoinColumn({name: 'role_id'})
    role: Role;

    @ManyToOne(() => Permission, permission => permission.pivotRoles)
    @JoinColumn({name: 'permission_id'})
    permission: Permission;
}
