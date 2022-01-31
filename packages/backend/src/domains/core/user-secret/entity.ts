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
import { RealmEntity, UserEntity } from '@typescript-auth/server';
import { SecretType, UserSecret } from '@personalhealthtrain/ui-common';
import { Realm, User } from '@typescript-auth/domains';

@Unique('keyUserId', [
    'key',
    'user_id',
])
@Entity({ name: 'user_secrets' })
export class UserSecretEntity implements UserSecret {
    @PrimaryGeneratedColumn('uuid')
        id: string;

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
        user_id: User['id'];

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    @Column()
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
