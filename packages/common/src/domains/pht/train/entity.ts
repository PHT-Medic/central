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
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../../auth";
import {User} from "../../auth";
import {MasterImage} from "../master-image";
import {Proposal} from "../proposal";
import {TrainFile} from "../train-file";
import {TrainModel} from "../train-model";
import {TrainResult, TrainResultStatus} from "../train-result";
import {TrainStation} from "../train-station";
import {TrainBuildStatus, TrainConfigurationStatus, TrainRunStatus} from "./status";

@Entity()
export class Train {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 10})
    type: string;

    @Column({nullable: true, type: "text"})
    query: string;

    @Column({nullable: true, type: "text"})
    hash: string;

    @Column({nullable: true, type: "text"})
    hash_signed: string

    @Column({nullable: true})
    session_id: string;

    @Column({nullable: true})
    entrypoint_file_id: number;

    @OneToOne(() => TrainFile, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({name: 'entrypoint_file_id'})
    entrypoint_file: TrainFile;

    @Column({nullable: true})
    entrypoint_executable: string;

    // ------------------------------------------------------------------

    @Column({type: "enum", nullable: true, default: null, enum: TrainConfigurationStatus})
    configuration_status: TrainConfigurationStatus | null;

    // ------------------------------------------------------------------

    @Column({type: "enum", nullable: true, default: null, enum: TrainBuildStatus})
    build_status: TrainBuildStatus | null;

    @Column({type: "uuid", nullable: true, default: null})
    build_id: string;

    // ------------------------------------------------------------------

    @Column({type: "enum", nullable: true, default: null, enum: TrainRunStatus})
    run_status: TrainRunStatus | null;

    @Column({type: "integer", unsigned: true, nullable: true, default: null})
    run_station_id: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.trains, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @Column({type: "int", unsigned: true, nullable: true})
    user_id: number;

    @ManyToOne(() => User, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToOne(() => TrainModel)
    model: TrainModel;

    @OneToMany(() => TrainFile, trainFile => trainFile.train)
    files: TrainFile[]

    @Column({type: "varchar", nullable: true, default: null})
    result_last_id: string;

    // todo: change to 1:n
    @OneToOne(() => TrainResult, trainResult => trainResult.train)
    result: TrainResult;

    @Column({type: "enum", nullable: true, default: null, enum: TrainResultStatus})
    result_status: TrainResultStatus | null;

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.trains, {onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @OneToMany(() => TrainStation, trainStation => trainStation.train)
    train_stations: TrainStation[];

    @Column({nullable: true})
    master_image_id: number;

    @ManyToOne(() => MasterImage, masterImage => masterImage.trains, {onDelete: 'CASCADE', nullable: true})
    @JoinColumn({name: 'master_image_id'})
    master_image: MasterImage;
}
