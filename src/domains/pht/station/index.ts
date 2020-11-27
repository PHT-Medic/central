import {
    Column, CreateDateColumn,
    Entity,
    Generated,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {Train} from "../train";
import {ProposalStation} from "../proposal/station";
import {Realm} from "../../realm";

@Entity()
export class Station {
    @PrimaryGeneratedColumn()
    id: number;

    @Generated("uuid")
    id_secure: string;

    @Column()
    name: string;

    @Column({nullable: true})
    public_key: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    realm_id: string;

    @OneToOne(() => Realm)
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @ManyToMany(() => Train, train => train.stations)
    trains: Train[]

    @OneToMany(() => ProposalStation, proposalStation => proposalStation.station)
    proposalStations: ProposalStation[]
}
