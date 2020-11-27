import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../user";
import {Proposal} from "../pht/proposal";
import {Train} from "../pht/train";

@Entity()
export class Realm {
    @PrimaryColumn({type: 'varchar', length: 36})
    id: string;

    @Column({type: 'varchar', length: 100})
    @Index({unique: true})
    name: string;

    @Column({type: "text", nullable: true, default: null})
    description: string;

    @Column({default: true})
    drop_able: boolean;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @OneToMany(() => User, user => user.realm)
    users: User[];

    @OneToMany(() => Proposal, proposal => proposal.realm)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.realm)
    trains: Train[];
}
