import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Station} from "../../station";
import {Train} from "../index";
import {TrainStationStateOpen} from "./states";

@Entity({name: 'train_stations'})
export class TrainStation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default: TrainStationStateOpen})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    @Column({type: "int", unsigned: true, nullable: true})
    position: number;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
    train_id: string;

    @ManyToOne(() => Train, train => train.train_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column()
    station_id: number;

    @ManyToOne(() => Station, station => station.train_stations, {onDelete: "CASCADE"})
    @JoinColumn({name: 'station_id'})
    station: Station;
}
