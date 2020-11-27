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

@Entity()
export class ProposalStation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 'open'})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.proposalStations)
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.proposalStations)
    @JoinColumn({name: 'station_id'})
    station: Station;
}
