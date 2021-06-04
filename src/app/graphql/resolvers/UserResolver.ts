import {Query, Resolver} from "type-graphql";
import {User} from "../../../domains/user";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../domains/user/repository";

@Resolver(User)
export class UserResolver {
    @Query(() => [User])
    users() {
        return getCustomRepository(UserRepository).find();
    }
}
