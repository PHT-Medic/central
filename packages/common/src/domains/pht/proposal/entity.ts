/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {Realm, User} from "../../auth";
import {MasterImage} from "../master-image/entity";
import {Train} from "../train";
import {ProposalStation} from "../proposal-station";

@Entity({name: 'proposals'})
export class Proposal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar"})
    title: string;

    @Column({type: "varchar"})
    requested_data: string;

    @Column({type: "varchar"})
    risk: string;

    @Column({type: "varchar"})
    risk_comment: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.proposals, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @Column({type: "int", unsigned: true, nullable: true})
    user_id: number;

    @ManyToOne(() => User, {onDelete: "SET NULL", nullable: true})
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => Train, train => train.proposal)
    trains: Train[];

    @Column()
    master_image_id: number;

    @ManyToOne(() => MasterImage, masterImage => masterImage.proposals, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'master_image_id'})
    master_image: MasterImage;

    @OneToMany(() => ProposalStation, proposalStation => proposalStation.proposal)
    proposal_stations: ProposalStation[];
}
