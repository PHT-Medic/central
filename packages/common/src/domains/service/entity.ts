/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {BeforeInsert, Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import {MASTER_REALM_ID, Client, Realm} from "../auth";

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

    @Column({default: MASTER_REALM_ID, nullable: true})
    realm_id: string;

    @BeforeInsert()
    setRealmId() {
        if(!this.realm_id) {
            this.realm_id = MASTER_REALM_ID;
        }
    }

    @ManyToOne(() => Realm)
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
