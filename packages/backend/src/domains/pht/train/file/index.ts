import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

import {User} from "../../../auth/user";
import {Train} from "../index";
import {Realm} from "../../../auth/realm";

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

    @ManyToOne(() => User,{onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column()
    train_id: string;

    @ManyToOne(() => Train, train => train.files, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column({nullable: true})
    realm_id: string;

    @ManyToOne(() => Realm, {onDelete: "SET NULL"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
