import {PermissionInterface} from "../../../../auth";
import {AuthorizationClientType} from "./index";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../../../../domains/user/repository";

export async function buildAuthPermissions(type: AuthorizationClientType, id: string | number) : Promise<PermissionInterface[]> {
    let permissions : PermissionInterface[] = [];

    switch (type) {
        case "service":
            // todo: implement service permissions
            break;
        case "user":
            const userRepository = getCustomRepository(UserRepository);

            permissions = await userRepository.findPermissions(id as number);
            break;
    }

    return permissions;
}
