import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Train} from "../index";
import {TrainResultStateOpen} from "./states";

@Entity({name: 'train_results'})
export class TrainResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: "varchar", length: 100, nullable: true})
    download_id: string;

    @Column({nullable: true, default: null})
    image: string;

    @Column({default: TrainResultStateOpen})
    status: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    train_id: string;

    @OneToOne(() => Train, train => train.result, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;
}
