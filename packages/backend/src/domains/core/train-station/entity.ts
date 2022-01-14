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
import { TrainStation, TrainStationApprovalStatus, TrainStationRunStatus } from '@personalhealthtrain/ui-common';
import { RealmEntity } from '@typescript-auth/server';
import { TrainEntity } from '../train/entity';
import { StationEntity } from '../station/entity';

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

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        train_id: string;

    @ManyToOne(() => TrainEntity, (train) => train.train_stations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
        train: TrainEntity;

    @Column()
        train_realm_id: string;

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_realm_id' })
        train_realm: RealmEntity;

    @Column()
        station_id: number;

    @ManyToOne(() => StationEntity, (station) => station.train_stations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
        station: StationEntity;

    @Column()
        station_realm_id: string;

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_realm_id' })
        station_realm: RealmEntity;
}
