/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../user';
import { SecretType } from './constants';

@Unique('keyUserId', [
    'key',
    'user_id',
])
@Entity({ name: 'user_secrets' })
export class UserSecret {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({ type: 'varchar', length: 100 })
        key: string;

    @BeforeUpdate()
    @BeforeInsert()
    setKey() {
        switch (this.type) {
            case SecretType.PAILLIER_PUBLIC_KEY:
            case SecretType.RSA_PUBLIC_KEY:
                this.key = this.type;
                break;
        }
    }

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
