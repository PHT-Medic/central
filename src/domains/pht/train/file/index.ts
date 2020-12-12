import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../../user";
import {Train} from "../index";
import {Realm} from "../../../realm";

@Entity()
export class TrainFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    hash: string;

    @Column({nullable: true})
    path: string;

    @Column({nullable: true})
    size: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User,{onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column()
    train_id: string;

    @ManyToOne(() => Train, train => train.files, {onDelete: "CASCADE"})
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, {onDelete: "SET NULL"})
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
