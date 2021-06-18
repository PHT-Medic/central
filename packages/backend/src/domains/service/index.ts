import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    getRepository,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {AuthClient, AuthClientType} from "../client";
import {MASTER_REALM_ID, Realm} from "../realm";

export enum BaseService {
    HARBOR = 'HARBOR',
    TRAIN_BUILDER = 'TRAIN_BUILDER',
    TRAIN_ROUTER = 'TRAIN_ROUTER',
    RESULT_SERVICE = 'RESULT_SERVICE'
}

@Entity()
export class Service {
    @PrimaryColumn({type: "varchar", length: 50, unique: true})
    id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @BeforeInsert()
    createClient() {
        if(typeof this.client === 'undefined') {
            this.client = getRepository(AuthClient).create({
                type: AuthClientType.SERVICE
            });
        }
    }

    @Column({type: "boolean"})
    client_synced: boolean;

    @OneToOne(() => AuthClient, client => client.service)
    client: AuthClient;

    @Column({default: MASTER_REALM_ID})
    realm_id: string;

    @OneToOne(() => AuthClient, {onDelete: "CASCADE"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
