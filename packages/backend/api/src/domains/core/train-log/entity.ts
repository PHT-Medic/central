/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    Train,
    TrainLog,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@authelion/server-core';
import { Realm } from '@authelion/common';
import { TrainEntity } from '../train/entity';

@Entity({ name: 'train_logs' })
export class TrainLogEntity implements TrainLog {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        component: string | null;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        command: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
        event: string | null;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        step: string | null;

    @Column({ type: 'boolean', default: false })
        error: boolean;

    @Column({ type: 'varchar', length: 64, nullable: true })
        error_code: string | null;

    @Index()
    @Column({
        type: 'varchar', length: 64, nullable: true, default: null,
    })
        status: string | null;

    @Column({ type: 'text', nullable: true })
        status_message: string | null;

    @Column({ type: 'text', nullable: true })
        meta: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        train_id: Train['id'];

    @ManyToOne(() => TrainEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
        train: TrainEntity;

    @Column()
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;
}
