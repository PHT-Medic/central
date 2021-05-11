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

@Entity()
export class TrainStation {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({default: TrainStationStateOpen})
    status: string;

    @Column({type: "text", nullable: true})
    comment: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

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
