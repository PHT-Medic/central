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
import { User } from '../user';
import { SecretType } from './constants';

@Entity({ name: 'user_secrets' })
export class UserSecret {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({ type: 'enum', enum: SecretType })
        type: SecretType;

    @Column({ type: 'text', nullable: true })
        content: string;

    @Column({ type: 'int', unsigned: true })
        user_id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: User;

    @CreateDateColumn()
        created_at: string;

    @UpdateDateColumn()
        updated_at: string;
}
