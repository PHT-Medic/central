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
import {Provider} from "../../provider";

@Entity()
@Index(['provider_id', 'user_id'], {unique: true})
export class UserAccount {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "int", unsigned: true})
    user_id!: number;

    @Column({type: "int", unsigned: true})
    provider_id!: number;

    @Column()
    provider_user_id: string;

    @Column()
    provider_user_name: string;

    @Column({nullable: true, default: null})
    provider_user_email: string;

    @Column()
    access_token: string;

    @Column()
    refresh_token: string;

    @Column({type: "date", nullable: true, default: null})
    expires_in: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    //-----------------------------------------------

    @ManyToOne(() => User, user => user.userAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Provider, provider => provider.userAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'provider_id'})
    provider: Provider;
}

