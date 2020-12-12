import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../index";

@Entity()
export class UserPublicKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text"})
    content: string;

    @Column()
    user_id: number;

    @OneToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;
}
