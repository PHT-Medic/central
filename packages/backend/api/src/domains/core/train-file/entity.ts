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
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Train, TrainFile } from '@personalhealthtrain/central-common';
import { RealmEntity, UserEntity } from '@authelion/api-core';
// eslint-disable-next-line import/no-cycle
import { Realm, User } from '@authelion/common';
import { TrainEntity } from '../train/entity';

@Entity({ name: 'train_files' })
export class TrainFileEntity implements TrainFile {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'varchar', length: 4096 })
        hash: string;

    @Column({ nullable: true })
        directory: string;

    @Column({ type: 'int', unsigned: true, nullable: true })
        size: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        user_id: User['id'];

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    @Column()
        train_id: Train['id'];

    @ManyToOne(() => TrainEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'train_id' })
        train: TrainEntity;

    @Column({ nullable: true })
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;
}
