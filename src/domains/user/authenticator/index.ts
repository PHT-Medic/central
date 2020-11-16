import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../index";
import {Authenticator} from "../../authenticator";

@Entity()
@Index(['authenticator_id', 'user_id'], {unique: true})
export class UserAuthenticator {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    authenticator_id!: number;

    @Column()
    user_id!: number;

    @Column({type: 'int', default: 999})
    power: number;

    @Column({type: 'text', nullable: true, default: null})
    scope: string;

    @Column({type: 'text', nullable: true, default: null})
    condition: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @ManyToOne(() => User, user => user.userAuthenticators)
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Authenticator, authenticator => authenticator.userAuthenticators)
    @JoinColumn({name: 'authenticator_id'})
    authenticator: Authenticator;
}

