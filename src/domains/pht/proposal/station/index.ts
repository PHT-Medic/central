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

@Entity()
export class ProposalStation {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({default: ProposalStationStateOpen})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.proposalStations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.proposalStations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'station_id'})
    station: Station;
}
