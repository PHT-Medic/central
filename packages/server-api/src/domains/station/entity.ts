/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Registry, Station } from '@personalhealthtrain/core';
import {
    Ecosystem, RegistryProject,
} from '@personalhealthtrain/core';
import type { Realm } from '@authup/core';
import { RegistryProjectEntity } from '../registry-project/entity';
import { RegistryEntity } from '../registry/entity';

@Unique('station_external_name_index', ['external_name'])
@Unique(['name', 'realm_id'])
@Entity({ name: 'stations' })
export class StationEntity implements Station {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
        external_name: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'text', nullable: true, select: false })
        public_key: string;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        email: string | null;

    @Column({
        type: 'varchar', length: 32, nullable: true, default: Ecosystem.DEFAULT,
    })
        ecosystem: Ecosystem | null;

    @Column({ type: 'boolean', default: false })
        hidden: boolean;

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        registry_id: Registry['id'] | null;

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_id' })
        registry: Registry | null;

    @Column({ nullable: true })
        registry_project_id: RegistryProject['id'];

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_project_id' })
        registry_project: RegistryProject;

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @BeforeInsert()
    @BeforeUpdate()
    setHidden() {
        if (!this.registry_id || !this.ecosystem) {
            this.hidden = true;
        }
    }
}
