import {
    Column, CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {Proposal} from "../proposal";
import {MasterImage} from "../master-image";
import {TrainResult} from "./result";
import {TrainFile} from "./file";
import {User} from "../user";
import {Realm} from "../realm";
import {TrainConfiguratorStateOpen} from "./states";
import {TrainStation} from "./station";
import {TrainModel} from "./model";

@Entity()
export class Train {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 10})
    type: string;

    @Column({nullable: true, type: "text"})
    query: string;

    @Column({nullable: true, type: "text"})
    hash: string;

    @Column({nullable: true, type: "text"})
    hash_signed: string

    @Column({nullable: true})
    session_id: string;

    @Column({nullable: true})
    entrypoint_file_id: number;

    @OneToOne(() => TrainFile, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({name: 'entrypoint_file_id'})
    entrypoint_file: TrainFile;

    @Column({nullable: true})
    entrypoint_executable: string;

    @Column({type: "varchar", default: TrainConfiguratorStateOpen})
    configurator_status: string;

    @Column({nullable: true, default: null})
    status: string;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.trains, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @Column({type: "int", unsigned: true, nullable: true})
    user_id: number;

    @ManyToOne(() => User,{ nullable: true, onDelete: "SET NULL" })
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToOne(() => TrainModel)
    model: TrainModel;

    @OneToMany(() => TrainFile, trainFile => trainFile.train)
    files: TrainFile[]

    @OneToOne(() => TrainResult, trainResult => trainResult.train)
    result: TrainResult;

    @Column()
    proposal_id: number;

    @ManyToOne(() => Proposal, proposal => proposal.trains, { onDelete: "CASCADE"})
    @JoinColumn({name: 'proposal_id'})
    proposal: Proposal;

    @OneToMany(() => TrainStation, trainStation => trainStation.train)
    train_stations: TrainStation[];

    @Column({nullable: true})
    master_image_id: number;

    @ManyToOne(() => MasterImage, masterImage => masterImage.trains, { onDelete: 'CASCADE', nullable: true})
    @JoinColumn({name: 'master_image_id'})
    master_image: MasterImage;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}
