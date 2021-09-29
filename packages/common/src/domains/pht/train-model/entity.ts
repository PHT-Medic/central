/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import {User} from "../../auth/user";
import {TrainFile} from "../train-file";

@Entity({name: 'train_models'})
export class TrainModel {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    type: string;

    @Column({type: "varchar"})
    name: string;

    @OneToOne(() => TrainFile)
    src: TrainFile;

    // ------------------------------------------------------------------

    @Column({type: "int", unsigned: true})
    user_id: number;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;
}
