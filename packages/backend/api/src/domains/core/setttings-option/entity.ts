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
import { SettingsOption } from '@personalhealthtrain/central-common';

@Entity({ name: 'settings_options' })
export class SettingsOptionEntity implements SettingsOption {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 196, unique: true })
        key: string;

    @Column({ type: 'text' })
        value: string;

    @Column({ type: 'boolean', default: true })
        autoload: boolean;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
