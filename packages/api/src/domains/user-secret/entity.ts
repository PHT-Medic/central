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
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { UserSecret } from '@personalhealthtrain/central-common';
import { SecretType } from '@personalhealthtrain/central-common';
import type { Realm, User } from '@authup/common';

@Unique('keyUserId', [
    'key',
    'user_id',
])
@Entity({ name: 'user_secrets' })
export class UserSecretEntity implements UserSecret {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 128 })
        key: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
        type: SecretType;

    @Column({ type: 'text', nullable: true })
        content: string;

    @Column()
        user_id: User['id'];

    @Column()
        realm_id: Realm['id'];

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
