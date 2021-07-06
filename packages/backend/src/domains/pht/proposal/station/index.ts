import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Proposal} from "../index";
import {Station} from "../../station";
import {ProposalStationStateOpen} from "./states";

@Entity({name: 'proposal_stations'})
export class ProposalStation {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({default: ProposalStationStateOpen})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.proposal_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.proposal_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'station_id'})
    station: Station;
}
