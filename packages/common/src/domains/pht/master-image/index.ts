/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Proposal} from "../proposal";
import {Train} from "../train";

@Entity({name: 'master_images'})
export class MasterImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({type: 'varchar'})
    path: string;

    @Column({type: "varchar"})
    name: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @OneToMany(() => Proposal, proposal => proposal.master_image)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.master_image)
    trains: Train[];
}
