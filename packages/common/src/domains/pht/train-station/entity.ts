/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Station} from "../station";
import {Train} from "../train";
import {TrainStationApprovalStatusType, TrainStationRunStatusType} from "./type";

@Entity({name: 'train_stations'})
export class TrainStation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ------------------------------------------------------------------

    @Column({default: null})
    approval_status: TrainStationApprovalStatusType | null;

    @Column({type: "varchar", nullable: true, default: null})
    run_status: TrainStationRunStatusType | null;

    // ------------------------------------------------------------------

    @Column({type: "text", nullable: true})
    comment: string;

    @Column({type: "int", unsigned: true, nullable: true})
    position: number;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    train_id: string;

    @ManyToOne(() => Train, train => train.train_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.train_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'station_id'})
    station: Station;
}
