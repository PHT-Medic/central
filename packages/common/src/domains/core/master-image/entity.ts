/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    Index, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { MasterImageGroup } from '../master-image-group';
import { MasterImageGroupType } from './type';

@Entity({ name: 'master_images' })
export class MasterImage {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', nullable: true })
        path: string | null;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 256 })
        virtual_path: string;

    @Index()
    @Column({ type: 'varchar', length: 256 })
        group_virtual_path: string;

    @Column({ type: 'varchar' })
        name: string;

    @Column({ type: 'text', nullable: true })
        command: string | null;

    @Column({ type: 'json', nullable: true })
        command_arguments: any | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;
}
