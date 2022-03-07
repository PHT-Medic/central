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
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Architecture, Station, createNanoID } from '@personalhealthtrain/central-common';
import { RealmEntity } from '@typescript-auth/server-core';
import { Realm } from '@typescript-auth/domains';

@Entity({ name: 'stations' })
export class StationEntity implements Station {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({
        type: 'varchar', length: 100, select: false, default: createNanoID(),
    })
        secure_id: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'text', nullable: true, select: false })
        public_key: string;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        email: string | null;

    @Column({
        type: 'varchar', length: 32, nullable: true, default: Architecture.DEFAULT,
    })
        architecture: string | null;

    // ------------------------------------------------------------------

    @Column({ nullable: true, default: null, select: false })
        registry_project_id: number | null;

    @Column({
        nullable: true, default: null, select: false, type: 'int',
    })
        registry_project_account_id: number | null;

    @Column({ nullable: true, default: null, select: false })
        registry_project_account_name: string | null;

    @Column({
        type: 'text', nullable: true, default: null, select: false,
    })
        registry_project_account_token: string | null;

    @Column({ default: false, select: false })
        registry_project_webhook_exists: boolean;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;
}
