import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Proposal} from "../proposal";
import {MasterImage} from "../master-image";
import {Station} from "../station";
import {TrainResult} from "./result";
import {TrainFile} from "./file";
import {User} from "../../user";
import {Realm} from "../../realm";

@Entity()
export class Train {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: "varchar", length: 10})
    type: string;

    @Column({type: "varchar", nullable: true})
    hash: string;

    @Column({type: "varchar", nullable: true})
    hash_signed: string

    @Column({type: "varchar", nullable: true})
    entrypoint_name: string;

    @Column({type: "varchar", nullable: true})
    entrypoint_command: string;

    @Column({type: "varchar", default: null})
    status: string;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.trains, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @Column()
    user_id: number;

    @ManyToOne(() => User,{ nullable: true, onDelete: "SET NULL" })
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => TrainFile, trainFile => trainFile.train)
    files: TrainFile[]

    @OneToOne(() => TrainResult, trainResult => trainResult.train)
    result: TrainResult;

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.trains, { onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @ManyToMany(() => Station, station => station.trains)
    @JoinTable()
    stations: Station[]

    @Column()
    master_image_id: number;

    @ManyToOne(() => MasterImage, masterImage => masterImage.trains, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'master_image_id'})
    master_image: MasterImage;
}
