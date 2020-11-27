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

    @Column({type: "text"})
    content: string;

    @Column()
    user_id: number;

    @ManyToOne(() => User, user => user.trainFiles)
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column()
    train_id: number;

    @ManyToOne(() => Train, train => train.files)
    @JoinColumn({name: 'train_id'})
    train: Train;

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm)
    @JoinColumn({name: 'realm_id'})
    realm: Realm;
}
