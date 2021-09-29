import {Proposal, Train} from "../../pht";
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
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
