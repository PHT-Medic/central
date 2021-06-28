import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, ManyToOne,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";

import {AuthClient} from "../client";
import {MASTER_REALM_ID, Realm} from "../realm";

export enum BaseService {
    HARBOR = 'HARBOR',
    TRAIN_BUILDER = 'TRAIN_BUILDER',
    TRAIN_ROUTER = 'TRAIN_ROUTER',
    RESULT_SERVICE = 'RESULT_SERVICE'
}

@Entity({synchronize: true})
export class Service {
    @PrimaryColumn({type: "varchar", length: 50, unique: true})
    id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column({type: "boolean", default: false})
    client_synced: boolean;

    @OneToOne(() => AuthClient, client => client.service, {nullable: true})
    client: AuthClient;

    @Column({default: MASTER_REALM_ID})
    realm_id: string;

    @ManyToOne(() => Realm)
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
