import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import {Train} from "../train";

@Entity({name: 'train_results'})
export class TrainResult {
    @PrimaryColumn({type: "uuid"})
    id: string;

    @Column({nullable: true, default: null})
    image: string;

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
