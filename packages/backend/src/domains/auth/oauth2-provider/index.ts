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
import {Oauth2ProviderAccount} from "./account";

export enum AuthenticatorScheme {
    OAUTH2 = "oauth2",
    OPENID = "openid"
}

@Entity({name: 'oauth2_providers'})
export class OAuth2Provider {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", length: 128})
    name: string;

    @Column({type: "boolean", default: false})
    open_id: boolean;

    @Column({type: "varchar", length: 256})
    client_id: string;

    @Column({type: "varchar", length: 256, nullable: true, default: null, select: false})
    client_secret: string

    @Column({type: "varchar", length: 256, nullable: true, default: null})
    token_host: string;

    @Column({type: "varchar", length: 128, nullable: true, default: null})
    token_path: string;

    @Column({type: "varchar", length: 128, nullable: true, default: null})
    token_revoke_path: string;

    @Column({type: "varchar", length: 256, nullable: true, default: null})
    authorize_host: string;

    @Column({type: "varchar", length: 128, nullable: true, default: null})
    authorize_path: string;

    @Column({type: "varchar", length: 256, nullable: true, default: null})
    user_info_host: string;

    @Column({type: "varchar", length: 128, nullable: true, default: null})
    user_info_path: string;

    @Column({type: "varchar", nullable: true, default: null})
    scope: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.providers, {onDelete: "CASCADE"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => Oauth2ProviderAccount, userAccount => userAccount.provider)
    accounts: Oauth2ProviderAccount[]
}
