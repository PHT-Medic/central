/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne, PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import {
    Ecosystem, Registry, RegistryProject, RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { Realm } from '@authelion/common';
import { RealmEntity } from '@authelion/api-core';
import { RegistryEntity } from '../registry/entity';

@Unique('registry_project_external_name_registry_index', ['external_name', 'registry_id'])
@Unique('registry_project_external_id_registry_index', ['external_id', 'registry_id'])
@Entity({ name: 'registry_projects' })
export class RegistryProjectEntity implements RegistryProject {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'varchar', length: 64, default: Ecosystem.DEFAULT })
        ecosystem: Ecosystem;

    @Column({
        type: 'varchar', length: 64, nullable: true, default: RegistryProjectType.DEFAULT,
    })
        type: RegistryProjectType;

    @Column({ type: 'boolean', default: true })
        public: boolean;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar',
        length: 64,
    })
        external_name: string;

    @Column({
        type: 'varchar',
        length: 64,
        nullable: true,
        default: null,
    })
        external_id: string | null;

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

    @Column({
        type: 'varchar', length: 128, default: null, nullable: true,
    })
        webhook_name: string | null;

    @Column({ type: 'boolean', default: false })
        webhook_exists: boolean;

    // ------------------------------------------------------------------

    @Column()
        registry_id: Registry['id'];

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'registry_id' })
        registry: RegistryEntity;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
