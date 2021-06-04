import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Proposal} from "../proposal";
import {Train} from "../train";

@Entity()
export class MasterImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar"})
    name: string;

    @Index()
    @Column({type: "varchar"})
    external_tag_id: string;

    @OneToMany(() => Proposal, proposal => proposal.master_image)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.master_image)
    trains: Train[];
}
