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
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import {
    Ecosystem, Registry, RegistryProject, Station,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@authelion/api-core';
import { Realm } from '@authelion/common';
import { RegistryProjectEntity } from '../registry-project/entity';
import { RegistryEntity } from '../registry/entity';

@Unique(['name', 'realm_id'])
@Entity({ name: 'stations' })
export class StationEntity implements Station {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
        external_id: string;

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

    @Column()
        registry_id: Registry['id'];

    @ManyToOne(() => RegistryEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'registry_id' })
        registry: Registry;

    @Column({ nullable: true })
        registry_project_id: RegistryProject['id'];

    @ManyToOne(() => RegistryProjectEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'registry_project_id' })
        registry_project: RegistryProject;

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
