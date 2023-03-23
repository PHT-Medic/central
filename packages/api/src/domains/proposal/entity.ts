/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { MasterImage, Proposal } from '@personalhealthtrain/central-common';
import { ProposalRisk } from '@personalhealthtrain/central-common';
import type { Realm, User } from '@authup/common';
import { MasterImageEntity } from '../master-image';

@Entity({ name: 'proposals' })
export class ProposalEntity implements Proposal {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        title: string;

    @Column({ type: 'varchar' })
        requested_data: string;

    @Column({ type: 'varchar', length: 64, default: ProposalRisk.LOW })
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

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    @Column({ type: 'uuid', nullable: true })
        user_id: User['id'];

    @Column({ nullable: true, default: null })
        master_image_id: MasterImage['id'] | null;

    @ManyToOne(() => MasterImageEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'master_image_id' })
        master_image: MasterImageEntity | null;
}
