/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../../auth";
import {User} from "../../auth";
import {Train} from "../train";


@Entity({name: 'train_files'})
export class TrainFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", length: 256})
    name: string;

    @Column({type: "varchar", length: 2048})
    hash: string;

    @Column({nullable: true})
    directory: string;

    @Column({type: "int", unsigned: true, nullable: true})
    size: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ------------------------------------------------------------------

    @Column({type: "int", unsigned: true})
    user_id: number;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column()
    train_id: string;

    @ManyToOne(() => Train, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column({nullable: true})
    realm_id: string;

    @ManyToOne(() => Realm, {onDelete: "SET NULL"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
