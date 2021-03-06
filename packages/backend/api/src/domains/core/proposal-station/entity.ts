/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import {
    Proposal, ProposalStation, ProposalStationApprovalStatus, Station,
} from '@personalhealthtrain/central-common';
import { RealmEntity } from '@authelion/api-core';
import { Realm } from '@authelion/common';
import { ProposalEntity } from '../proposal/entity';
import { StationEntity } from '../station/entity';

@Unique(['proposal_id', 'station_id'])
@Entity({ name: 'proposal_stations' })
export class ProposalStationEntity implements ProposalStation {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ default: null })
        approval_status: ProposalStationApprovalStatus | null;

    @Column({ type: 'text', nullable: true })
        comment: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        proposal_id: Proposal['id'];

    @ManyToOne(() => ProposalEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
        proposal: ProposalEntity;

    @Column()
        proposal_realm_id: Realm['id'];

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_realm_id' })
        proposal_realm: RealmEntity;

    @Column()
        station_id: Station['id'];

    @ManyToOne(() => StationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
        station: StationEntity;

    @Column()
        station_realm_id: string;

    @ManyToOne(() => RealmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_realm_id' })
        station_realm: RealmEntity;
}
