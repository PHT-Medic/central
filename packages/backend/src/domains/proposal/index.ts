import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../realm";
import {Train} from "../train";
import {User} from "../user";
import {MasterImage} from "../master-image";
import {ProposalStation} from "./station";

@Entity()
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

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

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
    proposal_stations: Array<ProposalStation>;
}
