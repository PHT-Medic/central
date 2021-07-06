import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../../auth/realm";
import {Train} from "../train";
import {User} from "../../auth/user";
import {MasterImage} from "../master-image";
import {ProposalStation} from "./station";

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

    @ManyToOne(() => Realm, realm => realm.proposals, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @Column({type: "int", unsigned: true, nullable: true})
    user_id: number;

    @ManyToOne(() => User,{ onDelete: "SET NULL", nullable: true })
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => Train, train => train.proposal)
    trains: Train[];

    @Column()
    master_image_id: number;

    @ManyToOne(() => MasterImage, masterImage => masterImage.proposals, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'master_image_id'})
    master_image: MasterImage;

    @OneToMany(() => ProposalStation, proposalStation => proposalStation.proposal)
    proposal_stations: ProposalStation[];
}
