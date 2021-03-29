import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, Index, JoinColumn,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Field, ID, ObjectType} from "type-graphql";

import {Realm} from "../realm";
import {UserAccount} from "./account";
import {UserRole} from "./role";


@Entity()
@ObjectType()
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Field(() => String)
    @Column({type: 'varchar', length: 30})
    @Index({unique: true})
    name: string;

    @Field(() => String)
    @Column({type: 'varchar', length: 255, default: null, nullable: true})
    email: string;

    @Field({nullable: true})
    @Column({type: 'varchar', length: 512, default: null, nullable: true, select: false})
    password: string;

    @Field(() => Date)
    @CreateDateColumn()
    created_at: string;

    @Field(() => Date)
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
