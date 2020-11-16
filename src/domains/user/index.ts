import {
    Column,
    CreateDateColumn,
    Entity, Index, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Role} from "../role";
import {Realm} from "../realm";
import {UserAuthenticator} from "./authenticator";

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

    @ManyToMany(() => Role, role => role.users)
    @JoinTable()
    roles: Role[];

    @ManyToOne(() => Realm, realm => realm.users, {nullable: true})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => UserAuthenticator, userAuthenticator => userAuthenticator.authenticator)
    userAuthenticators: UserAuthenticator[];
}
