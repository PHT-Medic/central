/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    Ecosystem, Registry,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@authelion/api-core';
import { Realm } from '@authelion/common';

@Entity({ name: 'registries' })
export class RegistryEntity implements Registry {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'varchar', length: 512 })
        address: string;

    @Column({ type: 'varchar', length: 64, default: Ecosystem.DEFAULT })
        ecosystem: Ecosystem;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar', length: 256, nullable: true,
    })
        account_name: string | null;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        account_secret: string | null;

    // ------------------------------------------------------------------

    @Column()
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
