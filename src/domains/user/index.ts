import {
    Column,
    CreateDateColumn,
    Entity, Index, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Realm} from "../realm";
import {UserAccount} from "./account";
import {UserRole} from "./role";
import {Proposal} from "../pht/proposal";
import {TrainFile} from "../pht/train/file";
import {Train} from "../pht/train";

@Entity()
export class User {
    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column({type: 'varchar', length: 30})
    @Index({unique: true})
    name: string;

    @Column({type: 'varchar', length: 255, default: null, nullable: true})
    email: string;

    @Column({type: 'varchar', length: 512, default: null, nullable: true})
    password: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string

    @Column()
    realm_id: string;

    @ManyToOne(() => Realm, realm => realm.users, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'realm_id'})
    realm: Realm;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];

    @OneToMany(() => UserAccount, userAccount => userAccount.provider)
    userAccounts: UserAccount[];

    @OneToMany(() => Proposal, proposal => proposal.user)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.user)
    trains: Train[];

    @OneToMany(() => TrainFile, trainFile => trainFile.user)
    trainFiles: TrainFile[];
}
