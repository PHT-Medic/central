/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Model } from '@personalhealthtrain/ui-common';
import { UserEntity } from '@typescript-auth/server';
import { TrainFile } from '../train-file';

@Entity({ name: 'models' })
export class ModelEntity implements Model {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar' })
        type: string;

    @Column({ type: 'varchar' })
        name: string;

    @OneToOne(() => TrainFile)
        src: TrainFile;

    // ------------------------------------------------------------------

    @Column()
        user_id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;
}
