import {v4} from 'uuid';
import {ProposalStation} from "../proposal-station";
import {Entity, PrimaryGeneratedColumn, Index, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn} from 'typeorm';
import {Realm} from "../../auth";
import {TrainStation} from "../train-station";

@Entity({name: 'stations'})
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({type: "varchar", length: 100, select: false, default: v4()})
    secure_id: string;

    @Column({type: "varchar", length: 128})
    name: string;

    @Column({type: "text", nullable: true, select: false})
    public_key: string;

    @Column({type: "varchar", length: 256, nullable: true, select: false})
    email: string | null;

    // ------------------------------------------------------------------

    @Column({nullable: true, default: null, select: false})
    harbor_project_id: number | null;

    @Column({nullable: true, default: null, select: false})
    harbor_project_account_name: string | null;

    @Column({type: "text", nullable: true, default: null, select: false})
    harbor_project_account_token: string | null;

    @Column({default: false, select: false})
    harbor_project_webhook_exists: boolean;

    @Column({default: false, select: false})
    vault_public_key_saved: boolean;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    realm_id: string;

    @OneToOne(() => Realm, {onDelete: "CASCADE"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => TrainStation, trainStation => trainStation.station)
    train_stations: TrainStation[];

    @OneToMany(() => ProposalStation, proposalStation => proposalStation.station)
    proposal_stations: ProposalStation[];
}
