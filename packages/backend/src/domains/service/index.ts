import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, ManyToOne,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";

import {Client} from "../auth/client";
import {MASTER_REALM_ID, Realm} from "../auth/realm";

export enum BaseService {
    HARBOR = 'HARBOR',
    TRAIN_BUILDER = 'TRAIN_BUILDER',
    TRAIN_ROUTER = 'TRAIN_ROUTER',
    RESULT_SERVICE = 'RESULT_SERVICE'
}

@Entity({name: 'services'})
export class Service {
    @PrimaryColumn({type: "varchar", length: 50, unique: true})
    id: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column({type: "boolean", default: false})
    client_synced: boolean;

    @OneToOne(() => Client, client => client.service, {nullable: true, cascade: ['update']})
    client: Client;

    @Column({default: MASTER_REALM_ID})
    realm_id: string;

    @ManyToOne(() => Realm)
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
