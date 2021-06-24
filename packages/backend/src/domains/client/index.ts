import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {createAuthClientSecret} from "./utils";
import {Service} from "../service";
import {User} from "../user";

export enum AuthClientType {
    SERVICE = 'service',
    USER = 'user'
}

@Entity()
export class AuthClient {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", length: 100})
    secret: string;

    @BeforeInsert()
    createSecret() {
        if(typeof this.secret === 'undefined') {
            this.secret = createAuthClientSecret();
        }
    }

    refreshSecret() {
        this.secret = createAuthClientSecret();
    }

    @Column({type: "varchar", length: 255})
    name: string;

    @Column({type: "text", nullable: true})
    description: string;

    @Column({type: "enum", enum: AuthClientType})
    type: AuthClientType;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column({nullable: true})
    service_id: string | null;

    @OneToOne(() => Service, service => service.client, {nullable: true})
    @JoinColumn({name: 'service_id'})
    service: Service | null;

    @Column({type: "int", length: 11, nullable: true})
    user_id: number | null;

    @OneToOne(() => AuthClient, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User | null;
}
