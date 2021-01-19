import {
    Column,
    CreateDateColumn,
    Entity, Index, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../realm";
import {UserAccount} from "./account";
import {UserRole} from "./role";

@Entity()
export class User {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({type: 'varchar', length: 30})
    @Index({unique: true})
    name: string;

    @Column({type: 'varchar', length: 255, default: null, nullable: true})
    email: string;

    @Column({type: 'varchar', length: 512, default: null, nullable: true})
    password: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column({type: "varchar"})
    realm_id: string;

    @ManyToOne(() => Realm,{ onDelete: 'CASCADE' })
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];

    @OneToMany(() => UserAccount, userAccount => userAccount.user)
    userAccounts: UserAccount[];
}
