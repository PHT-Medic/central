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
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import {
    Station,
    Train,
    TrainStation,
    TrainStationApprovalStatus,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@typescript-auth/server-core';
import { Realm } from '@typescript-auth/domains';
import { TrainEntity } from '../train/entity';
import { StationEntity } from '../station/entity';

@Unique(['station_id', 'train_id'])
@Entity({ name: 'train_stations' })
export class TrainStationEntity implements TrainStation {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    // ------------------------------------------------------------------

    @Column({ default: null })
        approval_status: TrainStationApprovalStatus | null;

    @Column({ type: 'varchar', nullable: true, default: null })
        run_status: TrainStationRunStatus | null;

    // ------------------------------------------------------------------

    @Column({ type: 'text', nullable: true })
        comment: string;

    @Column({ type: 'int', unsigned: true, nullable: true })
        position: number;

    @Column({ type: 'varchar', length: 32, nullable: true })
        artifact_tag: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
        artifact_digest: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        train_id: Train['id'];

    @ManyToOne(() => TrainEntity, (train) => train.train_stations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
        train: TrainEntity;

    @Column()
        train_realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_realm_id' })
        train_realm: RealmEntity;

    @Column()
        station_id: Station['id'];

    @ManyToOne(() => StationEntity, (station) => station.train_stations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
        station: StationEntity;

    @Column()
        station_realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_realm_id' })
        station_realm: RealmEntity;
}
