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
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {MasterImageGroupType} from "../master-image";

@Entity({name: 'master_image_groups'})
export class MasterImageGroup {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "enum", enum: MasterImageGroupType, default: MasterImageGroupType.DEFAULT})
    type: MasterImageGroupType;

    @Column({type: 'varchar', length: 128})
    name: string;

    @Column({type: "varchar", length: 12})
    version: string;

    @Column({type: "varchar", length: 5, nullable: true})
    license: string | null;

    @Column({type: "text", nullable: true})
    description: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
