import {
    Column,
    CreateDateColumn,
    Entity,
    Index, JoinColumn,
    OneToMany, OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {Proposal} from "../../pht/proposal";
import {Train} from "../../pht/train";
import {OAuth2Provider} from "../oauth2-provider";

@Entity({name: 'realms'})
export class Realm {
    @PrimaryColumn({type: 'varchar', length: 36})
    id: string;

    @Column({type: 'varchar', length: 100})
    @Index({unique: true})
    name: string;

    @Column({type: "text", nullable: true, default: null})
    description: string | null;

    @Column({default: true})
    drop_able: boolean;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @OneToMany(() => OAuth2Provider, provider => provider.realm)
    providers: OAuth2Provider[];

    @OneToMany(() => Proposal, proposal => proposal.realm)
    proposals: Proposal[];

    @OneToMany(() => Train, train => train.realm)
    trains: Train[];
}

export const MASTER_REALM_ID = 'master';
