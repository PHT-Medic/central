import {
    Column, CreateDateColumn,
    Entity,
    Generated,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

import {ProposalStation} from "../proposal/station";
import {Realm} from "../../realm";
import {TrainStation} from "../train/station";

@Entity()
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Generated("uuid")
    id_secure: string;

    @Column()
    name: string;

    @Column({type: "text", nullable: true, select: false})
    public_key: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    realm_id: string;

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

    @OneToOne(() => Realm, {onDelete: "CASCADE"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => TrainStation, trainStation => trainStation.station)
    train_stations: Array<TrainStation>;

    @OneToMany(() => ProposalStation, proposalStation => proposalStation.station)
    proposal_stations: Array<ProposalStation>;
}
