import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../user";

@Entity()
export class Realm {
    @PrimaryGeneratedColumn({unsigned: true})
    id: string;

    @Column({type: 'varchar', length: 100})
    @Index({unique: true})
    name: string;

    @Column({type: "text"})
    description: string;

    @OneToMany(() => User, user => user.realm)
    users: User[];
}
