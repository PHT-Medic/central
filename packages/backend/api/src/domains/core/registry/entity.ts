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
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    Ecosystem, Registry,
} from '@personalhealthtrain/central-common';

@Entity({ name: 'registries' })
export class RegistryEntity implements Registry {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 128 })
        name: string;

    @Column({ type: 'varchar', length: 512 })
        host: string;

    @Column({ type: 'varchar', length: 64, default: Ecosystem.DEFAULT })
        ecosystem: Ecosystem;

    // ------------------------------------------------------------------

    @Column({
        type: 'varchar', length: 256, nullable: true,
    })
        account_name: string | null;

    @Column({
        type: 'varchar', length: 256, nullable: true, select: false,
    })
        account_secret: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
