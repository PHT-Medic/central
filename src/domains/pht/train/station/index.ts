import {Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Proposal} from "../../proposal";
import {Station} from "../../station";
import {Train} from "../index";
import {TrainStationStateOpen} from "./states";

export class TrainStation {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({default: TrainStationStateOpen})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    train_id: string;

    @ManyToOne(() => Proposal, proposal => proposal.proposal_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    train: Train;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.proposal_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'station_id'})
    station: Station;
}
