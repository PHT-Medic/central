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
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../user";

@Entity({name: 'user_key_rings'})
export class UserKeyRing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text", nullable: true})
    public_key: string;

    @Column({type: "text", nullable: true})
    he_key: string;

    @Column({type: "int", unsigned: true})
    user_id: number;

    @OneToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}
