import {Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Proposal} from "../proposal";
import {Train} from "../train";

@Entity({name: 'master_images'})
export class MasterImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar"})
    name: string;

    @Index()
    @Column({type: "varchar"})
    external_tag_id: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @OneToMany(() => Proposal, proposal => proposal.master_image)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.master_image)
    trains: Train[];
}
