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
import {User} from "../../auth/user";
import {Realm} from "../../auth/realm";
import {TrainStation} from "./station";
import {TrainModel} from "./model";
import {TrainBuildStatus, TrainConfigurationStatus, TrainRunStatus} from "./status";

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

    // ------------------------------------------------------------------

    @Column({type: "varchar", nullable: true, default: true})
    configurator_status: TrainConfigurationStatus | null;

    @Column({type: "varchar", nullable: true, default: true})
    build_status: TrainBuildStatus | null;

    @Column({type: "varchar", nullable: true, default: null})
    run_status: TrainRunStatus | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

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
}
