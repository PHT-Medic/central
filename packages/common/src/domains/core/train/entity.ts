/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Realm, User } from '../../auth';
import { MasterImage } from '../master-image';
import { Proposal } from '../proposal';
import { TrainFile } from '../train-file';
import { TrainResultStatus } from '../train-result';
import { TrainStation } from '../train-station';
import {
    TrainBuildErrorCode,
    TrainBuildStatus, TrainConfigurationStatus, TrainRunErrorCode, TrainRunStatus,
} from './constants';

@Entity()
export class Train {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ length: 10 })
        type: string;

    @Index()
    @Column({ type: 'varchar', length: 128, nullable: true })
        name: string;

    @Column({ nullable: true, type: 'text' })
        query: string;

    @Column({ nullable: true, type: 'text' })
        hash: string;

    @Column({ nullable: true, type: 'text' })
        hash_signed: string;

    @Column({ nullable: true })
        session_id: string;

    @Column({ nullable: true })
        entrypoint_file_id: number;

    @OneToOne(() => TrainFile, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'entrypoint_file_id' })
        entrypoint_file: TrainFile;

    // ------------------------------------------------------------------

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainConfigurationStatus,
    })
        configuration_status: TrainConfigurationStatus | null;

    @BeforeInsert()
    @BeforeUpdate()
    setConfigurationStatus() {
        this.configuration_status = null;

        if (this.master_image_id || this.entrypoint_file_id) {
            this.configuration_status = TrainConfigurationStatus.RESOURCE_CONFIGURED;
        }

        if (this.hash) {
            this.configuration_status = TrainConfigurationStatus.HASH_GENERATED;

            if (this.hash_signed) {
                this.configuration_status = TrainConfigurationStatus.HASH_SIGNED;
            }
        }

        // check if all conditions are met
        if (this.hash_signed && this.hash) {
            this.configuration_status = TrainConfigurationStatus.FINISHED;
            this.run_status = null;
        }
    }

    // ------------------------------------------------------------------

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainBuildStatus,
    })
        build_status: TrainBuildStatus | null;

    @Column({ type: 'uuid', nullable: true, default: null })
        build_id: string;

    @Column({
        type: 'enum', enum: TrainBuildErrorCode, default: null, nullable: true,
    })
        build_error_code: TrainBuildErrorCode | null;

    // ------------------------------------------------------------------

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainRunStatus,
    })
        run_status: TrainRunStatus | null;

    @Column({
        type: 'integer', unsigned: true, nullable: true, default: null,
    })
        run_station_id: number | null;

    @Column({
        type: 'integer', unsigned: true, nullable: true, default: null,
    })
        run_station_index: number | null;

    @Column({
        type: 'enum', enum: TrainRunErrorCode, default: null, nullable: true,
    })
        run_error_code: TrainRunErrorCode | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        realm_id: string;

    @ManyToOne(() => Realm, (realm) => realm.trains, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: Realm;

    @Column({ type: 'int', unsigned: true, nullable: true })
        user_id: number;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
        user: User;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true, default: null })
        result_last_id: string;

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainResultStatus,
    })
        result_last_status: TrainResultStatus | null;

    // ------------------------------------------------------------------
    @Column()
        proposal_id: number;

    @ManyToOne(() => Proposal, (proposal) => proposal.trains, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
        proposal: Proposal;

    // ------------------------------------------------------------------

    @OneToMany(() => TrainStation, (trainStation) => trainStation.train)
        train_stations: TrainStation[];

    // ------------------------------------------------------------------

    @Column({ nullable: true })
        master_image_id: string | null;

    @ManyToOne(() => MasterImage, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImage;
}
