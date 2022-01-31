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
import {
    MasterImage,
    Proposal,
    Station,
    Train,
    TrainBuildErrorCode,
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainFile,
    TrainResult,
    TrainResultStatus,
    TrainRunErrorCode,
    TrainRunStatus, TrainType,
    UserSecret,
} from '@personalhealthtrain/ui-common';
import { RealmEntity, UserEntity } from '@typescript-auth/server';
import { Realm, User } from '@typescript-auth/domains';
import { ProposalEntity } from '../proposal/entity';
import { MasterImageEntity } from '../master-image/entity';
import { TrainFileEntity } from '../train-file/entity';
import { TrainStationEntity } from '../train-station/entity';
import { UserSecretEntity } from '../user-secret/entity';

@Entity()
export class TrainEntity implements Train {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'enum', enum: TrainType, default: TrainType.ANALYSE })
        type: TrainType;

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
        entrypoint_file_id: TrainFile['id'];

    @OneToOne(() => TrainFileEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'entrypoint_file_id' })
        entrypoint_file: TrainFileEntity;

    @Column({ type: 'int', unsigned: true, default: 0 })
        stations: number;

    // ------------------------------------------------------------------

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainConfigurationStatus,
    })
        configuration_status: TrainConfigurationStatus | null;

    @BeforeInsert()
    @BeforeUpdate()
    setConfigurationStatus() {
        this.configuration_status = null;

        if (this.stations > 0) {
            this.configuration_status = TrainConfigurationStatus.BASE_CONFIGURED;
        } else {
            return;
        }

        if (this.user_rsa_secret_id) {
            this.configuration_status = TrainConfigurationStatus.SECURITY_CONFIGURED;
        } else {
            return;
        }

        if (this.entrypoint_file_id) {
            this.configuration_status = TrainConfigurationStatus.RESOURCE_CONFIGURED;
        } else {
            return;
        }

        if (this.hash) {
            this.configuration_status = TrainConfigurationStatus.HASH_GENERATED;
        } else {
            return;
        }

        if (this.hash_signed) {
            this.configuration_status = TrainConfigurationStatus.HASH_SIGNED;
        } else {
            return;
        }

        // check if all conditions are met
        this.configuration_status = TrainConfigurationStatus.FINISHED;
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
        run_station_id: Station['id'] | null;

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
        realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'realm_id' })
        realm: RealmEntity;

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        user_rsa_secret_id: UserSecret['id'] | null;

    @ManyToOne(() => UserSecretEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_rsa_secret_id' })
        user_rsa_secret: UserSecretEntity | null;

    @Column({ nullable: true, type: 'uuid' })
        user_paillier_secret_id: UserSecret['id'] | null;

    @ManyToOne(() => UserSecretEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_paillier_secret_id' })
        user_paillier_secret_: UserSecretEntity | null;

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        user_id: User['id'];

    @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true, default: null })
        result_last_id: TrainResult['id'];

    @Column({
        type: 'enum', nullable: true, default: null, enum: TrainResultStatus,
    })
        result_last_status: TrainResultStatus | null;

    // ------------------------------------------------------------------
    @Column({ type: 'uuid' })
        proposal_id: Proposal['id'];

    @ManyToOne(() => ProposalEntity, (proposal) => proposal.trains, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
        proposal: ProposalEntity;

    // ------------------------------------------------------------------

    @OneToMany(() => TrainStationEntity, (trainStation) => trainStation.train)
        train_stations: TrainStationEntity[];

    // ------------------------------------------------------------------

    @Column({ nullable: true, type: 'uuid' })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity;
}
