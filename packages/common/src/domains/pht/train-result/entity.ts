/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn, ManyToOne
} from 'typeorm';
import {Train} from "../train";
import {TrainResultStatus} from "./status";

@Entity({name: 'train_results'})
export class TrainResult {
    @PrimaryColumn({type: "uuid"})
    id: string;

    @Column({nullable: true, default: null})
    image: string;

    @Column({type: "enum", nullable: true, default: null, enum: TrainResultStatus})
    status: TrainResultStatus | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    train_id: string;

    @ManyToOne(() => Train, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;
}
