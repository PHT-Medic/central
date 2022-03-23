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
    ManyToOne, PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    Ecosystem, Registry, RegistryProject, RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@authelion/api-core';
import { Realm } from '@authelion/common';
import { RegistryEntity } from '../registry/entity';

@Entity({ name: 'registry_projects' })
export class RegistryProjectEntity implements RegistryProject {
    @PrimaryColumn('uuid')
        id: string;

    @Column({
        type: 'varchar',
        length: 64,
        select: false,
        unique: true,
    })
        external_name: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'varchar', length: 64, default: Ecosystem.DEFAULT })
        ecosystem: Ecosystem;

    @Column({
        type: 'varchar', length: 64, nullable: true, default: RegistryProjectType.DEFAULT,
    })
        type: RegistryProjectType;

    // ------------------------------------------------------------------
    @Column({
        type: 'varchar',
        length: 64,
        unique: true,
    })
        external_id: string;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar', length: 64, nullable: true,
    })
        account_id: string | null;

    @Column({
        type: 'varchar', length: 256, nullable: true,
    })
        account_name: string | null;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        account_secret: string | null;

    // ------------------------------------------------------------------

    @Column({ type: 'boolean', default: false })
        webhook_exists: boolean;

    // ------------------------------------------------------------------

    @Column()
        registry_id: Registry['id'];

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'registry_id' })
        registry: RegistryEntity;

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
