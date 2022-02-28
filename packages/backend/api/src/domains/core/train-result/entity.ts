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
    PrimaryColumn, UpdateDateColumn,
} from 'typeorm';
import { TrainResult, TrainResultStatus } from '@personalhealthtrain/central-common';
import { RealmEntity, UserEntity } from '@typescript-auth/server-core';
import { TrainEntity } from '../train/entity';

@Entity({ name: 'train_results' })
export class TrainResultEntity implements TrainResult {
    @PrimaryColumn({ type: 'uuid' })
        id: string;

    @Column({ nullable: true, default: null })
        image: string;

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainResultStatus,
    })
        status: TrainResultStatus | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        train_id: string;

    @ManyToOne(() => TrainEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
        train: TrainEntity;

    // ------------------------------------------------------------------

    @Column()
        user_id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    // ------------------------------------------------------------------

    @Column()
        realm_id: string;

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;
}
