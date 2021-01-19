import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../index";

@Entity()
export class UserKeyRing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text", nullable: true})
    public_key: string;

    @Column({type: "text", nullable: true})
    he_key: string;

    @Column()
    user_id: number;

    @OneToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}
