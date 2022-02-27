/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { MasterImage, Proposal, ProposalRisk } from '@personalhealthtrain/central-common';
import { RealmEntity, UserEntity } from '@typescript-auth/server-core';
import { Realm, User } from '@typescript-auth/domains';
import { ProposalStationEntity } from '../proposal-station/entity';
import { MasterImageEntity } from '../master-image/entity';

@Entity({ name: 'proposals' })
export class ProposalEntity implements Proposal {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        title: string;

    @Column({ type: 'varchar' })
        requested_data: string;

    @Column({ type: 'enum', enum: ProposalRisk })
        risk: ProposalRisk;

    @Column({ type: 'varchar', length: 4096 })
        risk_comment: string;

    @Column({ type: 'int', unsigned: true, default: 0 })
        trains: number;

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

    @Column()
        user_id: User['id'];

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    @Column({ nullable: true, default: null })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity | null;

    @OneToMany(() => ProposalStationEntity, (proposalStation) => proposalStation.proposal)
        proposal_stations: ProposalStationEntity[];
}
