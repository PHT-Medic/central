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
import { UserEntity } from '@typescript-auth/server';
import { SecretType, UserSecret } from '@personalhealthtrain/ui-common';

@Unique('keyUserId', [
    'key',
    'user_id',
])
@Entity({ name: 'user_secrets' })
export class UserSecretEntity implements UserSecret {
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

    @Column()
        user_id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
