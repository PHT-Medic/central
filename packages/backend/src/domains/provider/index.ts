import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {Realm} from "../realm";
import {UserAccount} from "../user/account";

export enum AuthenticatorScheme {
    OAUTH2 = "oauth2",
    OPENID = "openid"
}

export enum AuthenticatorGrantType {
    PASSWORD = "password",
    CODE = "code"
}

@Entity()
export class Provider {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({type: "varchar", length: 30})
    @Index()
    name: string;

    @Column({
        type: "varchar",
        default: AuthenticatorScheme.OAUTH2
    })
    scheme: string;

    @Column({type: "varchar", nullable: true, default: null})
    token_host: string;

    @Column({type: "varchar", nullable: true, default: null})
    token_path: string;

    @Column({type: "varchar", nullable: true, default: null})
    token_revoke_path: string;

    @Column({type: "varchar", nullable: true, default: null})
    authorize_host: string;

    @Column({type: "varchar", nullable: true, default: null})
    authorize_path: string;

    @Column({type: "varchar", nullable: true, default: null})
    scope: string;

    @Column({nullable: true, default: null})
    client_id: string;

    @Column({nullable: true, default: null, select: false})
    client_secret: string

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.providers, {onDelete: "CASCADE"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => UserAccount, userAccount => userAccount.provider)
    userAccounts: UserAccount[]
}
