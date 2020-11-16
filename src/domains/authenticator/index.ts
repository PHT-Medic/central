import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Realm} from "../realm";
import {UserAuthenticator} from "../user/authenticator";

export enum AuthenticatorScheme {
    OAUTH2 = "oauth2",
    OPENID = "openid"
}

export enum AuthenticatorGrantType {
    PASSWORD = "password",
    CODE = "code"
}

@Entity()
export class Authenticator {
    @PrimaryGeneratedColumn({unsigned: true})
    id: string;

    @Column({
        type: "varchar",
        default: AuthenticatorScheme.OAUTH2
    })
    scheme: string;

    @Column({
        type: "varchar",
        default: AuthenticatorGrantType.PASSWORD
    })
    grant_type: string;

    @Column({nullable: true, default: null})
    token_url: string;

    @Column({nullable: true, default: null})
    authorization_url: string;

    @Column({nullable: true, default: null})
    user_info_url: string;

    @Column({nullable: true, default: null})
    client_id: string;

    @Column({nullable: true, default: null})
    client_secret: string

    @ManyToOne(() => Realm, realm => realm.users, {nullable: true})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => UserAuthenticator, userAuthenticator => userAuthenticator.authenticator)
    userAuthenticators: UserAuthenticator[]
}
