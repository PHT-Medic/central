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
    UpdateDateColumn
} from "typeorm";

import {MasterImageGroup} from "../master-image-group";

@Entity({name: 'master_images'})
export class MasterImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({type: 'varchar'})
    path: string;

    @Column({type: "varchar"})
    name: string;

    @ManyToOne(() => MasterImageGroup, {onDelete: "CASCADE"})
    group: MasterImageGroup;

    @Column({type: "varchar", length: 20, nullable: true})
    group_id: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
