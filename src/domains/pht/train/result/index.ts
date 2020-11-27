import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Train} from "../index";

@Entity()
export class TrainResult {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    train_id: number;

    @OneToOne(() => Train, train => train.result)
    @JoinColumn({name: 'train_id'})
    train: Train;
}
